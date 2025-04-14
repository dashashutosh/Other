import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, SegmentGroup, Segment } from '@walmart/living-design-sc-ui';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
import ManageableFieldsEnum from '../utils/LoadConfigs/ManageableFieldsEnum';
import ValidationsEnum from '../utils/LoadConfigs/ValidationsEnum';
import ManageableCardsEnum from '../utils/LoadConfigs/ManageableCardsEnum';
import { NON_DEDICATED_CARRIERS } from '../Constants';
import { UILoadTypeEnum } from '@walmart/stride-ui-commons';
import ServiceLevelEnum from '../utils/LoadConfigs/ServiceLevelEnum';
const { Grid, makeStyles } = MaterialUiCore,
    { localizeLang } = LocalizeLang.default;

const styles = makeStyles({
    serviceLevelContainer: {
        '& span[data-testid^="level"]': {
            opacity: '0.4',
            pointerEvents: 'none',
        },
    },
});
export default function ServiceDetails(props) {
    const { pDetails, pOnEdit, pStaticData, pPageConfig, pLoadType, pCarrier } = props;
    const trans = localizeLang();
    const classes = styles();
    const filteredStaticData = useMemo(() => {
        const serviceModes = pStaticData?.serviceModeList?.filter((mode) => mode?.id === 'TL' || mode?.id === 'LTL');
        let serviceLevelData = [];
        if (
            pLoadType === UILoadTypeEnum.GRSTR.name &&
            pPageConfig?.sections[ManageableCardsEnum.CARRIER_DETAILS.name]
        ) {
            serviceLevelData = pStaticData?.serviceLevelList?.filter(
                (level) =>
                    level?.id === ServiceLevelEnum.SINGLE.name ||
                    level?.id === ServiceLevelEnum.TEAM.name ||
                    level?.id === ServiceLevelEnum.DEDF.name,
            );
        } else {
            serviceLevelData = pStaticData?.serviceLevelList?.filter(
                (level) => level?.id === ServiceLevelEnum.SINGLE.name || level?.id === ServiceLevelEnum.TEAM.name,
            );
        }

        return {
            serviceModes,
            serviceLevels: serviceLevelData,
        };
    }, [pStaticData, pLoadType]);

    const isDedicatedCarrierForGRSTR = useMemo(() => {
        return (
            pPageConfig?.sections[ManageableCardsEnum.CARRIER_DETAILS.name] &&
            pLoadType === UILoadTypeEnum.GRSTR.name &&
            pCarrier &&
            !NON_DEDICATED_CARRIERS.includes(pCarrier?.id)
        );
    }, [pLoadType, pCarrier?.id, pPageConfig?.sections]);

    const decideServiceLevelSelection = useCallback(() => {
        if (isDedicatedCarrierForGRSTR) {
            return ServiceLevelEnum.DEDF.name;
        } else {
            return pDetails?.serviceLevel;
        }
    }, [isDedicatedCarrierForGRSTR, pDetails?.serviceLevel]);

    useEffect(() => {
        if (isDedicatedCarrierForGRSTR) {
            pOnEdit('serviceLevel', ServiceLevelEnum.DEDF.name);
        }
    }, [isDedicatedCarrierForGRSTR]);

    return (
        <>
            <Card elevation="3" size="standard">
                <div className="d-flex justify-content-between align-items-baseline py-1">
                    <Typography variant="h6" align="left" className="font-weight-bold p-3">
                        {trans('title.serviceDetails')}
                    </Typography>
                </div>
                <CardContent className="my-0 mx-0 p-3 w-100">
                    <Grid container spacing={2}>
                        <Grid container item spacing={2}>
                            {pPageConfig?.fields[ManageableFieldsEnum.MODE.name] && (
                                <Grid item spacing={2} xs={5}>
                                    <SegmentGroup
                                        label={
                                            pPageConfig?.fields[ManageableFieldsEnum.MODE.name]?.validations?.includes(
                                                ValidationsEnum.MANDATORY_FIELD.code,
                                            )
                                                ? `*${trans('subTitle.mode')}`
                                                : trans('subTitle.mode')
                                        }
                                        onClick={(e) => {
                                            const value = e.currentTarget.dataset.name;
                                            const { id } = filteredStaticData?.serviceModes?.find(
                                                (item) => item?.value === value,
                                            );
                                            pOnEdit('mode', id);
                                        }}
                                    >
                                        {filteredStaticData?.serviceModes?.map((option) => (
                                            <Segment
                                                key={option?.id}
                                                isSelected={option?.id === pDetails?.mode}
                                                data-testid="mode"
                                            >
                                                {option?.value}
                                            </Segment>
                                        ))}
                                    </SegmentGroup>
                                </Grid>
                            )}
                            {pPageConfig?.fields[ManageableFieldsEnum.LEVEL.name] && (
                                <Grid
                                    item
                                    spacing={2}
                                    xs={5}
                                    className={isDedicatedCarrierForGRSTR ? classes.serviceLevelContainer : ''}
                                >
                                    <SegmentGroup
                                        label={
                                            pPageConfig?.fields[ManageableFieldsEnum.LEVEL.name]?.validations?.includes(
                                                ValidationsEnum.MANDATORY_FIELD.code,
                                            )
                                                ? `*${trans('subTitle.level')}`
                                                : trans('subTitle.level')
                                        }
                                        onClick={(e) => {
                                            const value = e.currentTarget.dataset.name;
                                            pOnEdit('serviceLevel', value);
                                        }}
                                    >
                                        {filteredStaticData?.serviceLevels?.map((option) => (
                                            <Segment
                                                key={option?.id}
                                                isSelected={option?.id === decideServiceLevelSelection()}
                                                data-testid="level"
                                            >
                                                {option?.id}
                                            </Segment>
                                        ))}
                                    </SegmentGroup>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}

ServiceDetails.propTypes = {
    pDetails: PropTypes.shape({
        mode: PropTypes.string,
        serviceLevel: PropTypes.string,
    }).isRequired,
    pOnEdit: PropTypes.func.isRequired,
    pStaticData: PropTypes.shape({
        serviceLevelList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        serviceModeList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
    pPageConfig: PropTypes.shape({}).isRequired,
    pLoadType: PropTypes.string.isRequired,
    pCarrier: PropTypes.shape({}).isRequired,
};
