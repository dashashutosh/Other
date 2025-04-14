import React, { useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Divider } from '@walmart/living-design-sc-ui';
import {
    InlineAlert,
    AutoCompleteEntity,
    LOCATION_TYPE_ICON_MAP,
    getLocationTypeToIconMap,
    isValidTimezoneIANAString,
    Calendar,
    LOCAL_TIME_ZONE,
} from '@walmart/stride-ui-commons';
import { getAutoEntityAPIParams } from '../service/ServiceAPI';
import { locationStaticDataTransformer } from './DataModels';
import { getShortTimezoneAbbr } from '../utils/CommonUtils';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
import { AppUtils } from '@gscope-mfe/app-bridge';
const { makeStyles, Grid } = MaterialUiCore,
    { localizeLang } = LocalizeLang.default;
const styles = makeStyles({
    imageContainer: {
        zIndex: 1,
    },
    root: {
        position: 'relative',
        '&::before': {
            position: 'absolute',
            width: 2,
            borderLeft: '2px dashed #46474A',
            left: 23,
            top: 55,
            bottom: 58,
            content: '""',
        },
    },
    ldCalendar: {
        '&.ld-sc-ui-datepicker': {
            width: '100% !important',
        },
    },
    lastLocationStyle: {
        position: 'absolute',
        bottom: '28px',
    },
});
export default function LocationDetails(props) {
    const { pDetails, pOnEdit, pStaticData, pCmsConfig } = props;
    const { currentMarket, prefLang, userInfo } = AppUtils.get();
    const trans = localizeLang();
    const classes = styles();
    const APIParams = getAutoEntityAPIParams(currentMarket, prefLang.current, userInfo);
    const originLocationType = useMemo(() => pDetails?.originLocationId?.locationType, [pDetails]);
    const destinationLocationType = useMemo(() => pDetails?.destLocationId?.locationType, [pDetails]);
    const originOlsenId = useMemo(() => pDetails?.originLocationIdInfo?.timeZoneInfo?.olsenTimezoneId, [pDetails]);
    const originTimezoneCode = useMemo(() => pDetails?.originLocationIdInfo?.timeZoneInfo?.timeZoneCode, [pDetails]);
    const getTimeZoneAbbBasedOnFeatureFlag = (id, code) => {
        const shortAbb = getShortTimezoneAbbr(id, pStaticData?.timezoneJuris);
        if (shortAbb) {
            return shortAbb;
        }
        return code;
    };
    return (
        <>
            <Card elevation="3" size="standard">
                <div className="d-flex justify-content-between align-items-baseline py-1">
                    <Typography variant="h6" align="left" className="font-weight-bold p-3">
                        {trans('title.locationDetails')}
                    </Typography>
                </div>
                <Divider />
                <CardContent className="my-0 mx-0 p-3 w-100">
                    <Grid container spacing={2}>
                        <Grid container item spacing={2} xs={6}>
                            <div className="w-100 px-2">
                                <InlineAlert pVariant="info" pMessage={trans('info.locationDetails')} />
                            </div>
                            <div className={clsx(classes.root, 'py-4 d-flex w-100 px-2')}>
                                <div className={clsx('pt-1', classes.imageContainer)}>
                                    <img
                                        src={LOCATION_TYPE_ICON_MAP[getLocationTypeToIconMap(originLocationType)]}
                                        alt={originLocationType ? `${originLocationType} icon` : ''}
                                    />
                                    <div className={classes.lastLocationStyle}>
                                        <img
                                            src={
                                                LOCATION_TYPE_ICON_MAP[
                                                    getLocationTypeToIconMap(destinationLocationType)
                                                ]
                                            }
                                            alt={destinationLocationType ? `${destinationLocationType} icon` : ''}
                                        />
                                    </div>
                                </div>
                                <div className="w-100 pl-2">
                                    <div>
                                        <AutoCompleteEntity
                                            data-testid="originId"
                                            label={trans('label.originLocId')}
                                            entity="locations"
                                            maxSuggestions={pCmsConfig?.autoCompleteMaxCount}
                                            onSaveChangesClick={(_value) => pOnEdit('originLocationId', _value)}
                                            value={pDetails?.originLocationId?.value}
                                            apiConfig={APIParams}
                                            dataTransformer={locationStaticDataTransformer}
                                            minSearchTextLength={pCmsConfig?.autoCompleteMinSearchLength}
                                            config={{ disableSaveCancelBtn: true }}
                                        />
                                    </div>
                                    <div className="st-ui-pt-4">
                                        <Calendar
                                            id="pickUpDT"
                                            label={trans('label.pickup')}
                                            onChange={(e) => {
                                                pOnEdit('pickUpDT', e);
                                            }}
                                            date={pDetails.pickUpDT}
                                            showTimeInput
                                            className={classes.ldCalendar}
                                            errorText={
                                                pDetails.pickUpDT && pDetails.pickUpDT < new Date()
                                                    ? trans('createLoad.pickupDate.validation.msg')
                                                    : ''
                                            }
                                            onClear={(e) => {
                                                pOnEdit('pickUpDT', e);
                                            }}
                                            variant={
                                                pDetails.pickUpDT && pDetails.pickUpDT < new Date()
                                                    ? 'error'
                                                    : 'default'
                                            }
                                            timeZone={
                                                isValidTimezoneIANAString(originOlsenId)
                                                    ? originOlsenId
                                                    : LOCAL_TIME_ZONE
                                            }
                                            timeZoneAbbr={
                                                isValidTimezoneIANAString(originOlsenId)
                                                    ? getTimeZoneAbbBasedOnFeatureFlag(
                                                          originOlsenId,
                                                          originTimezoneCode,
                                                      )
                                                    : ''
                                            }
                                        />
                                    </div>
                                    <div className="st-ui-pt-4">
                                        <AutoCompleteEntity
                                            label={trans('label.destinationLocId')}
                                            entity="locations"
                                            maxSuggestions={pCmsConfig?.autoCompleteMaxCount}
                                            onSaveChangesClick={(_value) => pOnEdit('destLocationId', _value)}
                                            value={pDetails?.destLocationId?.value}
                                            apiConfig={APIParams}
                                            dataTransformer={locationStaticDataTransformer}
                                            config={{ disableSaveCancelBtn: true }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Grid>
                        <Grid xs={6} />
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}
LocationDetails.propTypes = {
    pDetails: PropTypes.shape({
        requestType: PropTypes.string,
        originLocationId: PropTypes.shape({
            value: PropTypes.string,
            locationType: PropTypes.string,
        }),
        originLocationIdInfo: PropTypes.shape({
            timeZoneInfo: PropTypes.shape({
                olsenTimezoneId: PropTypes.string,
                timeZoneCode: PropTypes.string,
            }),
        }),
        destLocationId: PropTypes.shape({
            value: PropTypes.string,
            locationType: PropTypes.string,
        }),
        pickUpDT: PropTypes.string,
    }).isRequired,
    pOnEdit: PropTypes.func.isRequired,
    pStaticData: PropTypes.shape({
        timezoneJuris: PropTypes.arrayOf(PropTypes.shape({})),
    }).isRequired,
    pCmsConfig: PropTypes.shape({
        autoCompleteMaxCount: PropTypes.number,
        autoCompleteMinSearchLength: PropTypes.number,
    }).isRequired,
};
