import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Divider } from '@walmart/living-design-sc-ui';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
import { carrierStaticDataTransformer } from './DataModels';
import ManageableFieldsEnum from '../utils/LoadConfigs/ManageableFieldsEnum';
import ValidationsEnum from '../utils/LoadConfigs/ValidationsEnum';
import { getAutoEntityAPIParams } from '../service/ServiceAPI';
import { AutoCompleteEntity } from '@walmart/stride-ui-commons';
import { AppUtils } from '@gscope-mfe/app-bridge';
const { Grid } = MaterialUiCore,
    { localizeLang } = LocalizeLang.default;

export default function CarrierDetails(props) {
    const { pDetails, pOnEdit, pPageConfig, pCmsConfig } = props;
    const trans = localizeLang();
    const { currentMarket, prefLang, userInfo } = AppUtils.get();
    const APIParams = getAutoEntityAPIParams(currentMarket, prefLang.current, userInfo);

    return (
        <>
            <Card elevation="3" size="standard">
                <div className="d-flex justify-content-between align-items-baseline py-1">
                    <Typography variant="h6" align="left" className="font-weight-bold p-3">
                        {trans('title.carrierDetails')}
                    </Typography>
                </div>
                <Divider />
                <CardContent className="w-100">
                    <Grid container spacing={2}>
                        <Grid container item spacing={2}>
                            <Grid item spacing={2} xs={12}>
                                <div>
                                    {pPageConfig[ManageableFieldsEnum.CARRIER_ID.name] && (
                                        <AutoCompleteEntity
                                            data-testid="carrierId"
                                            label={
                                                pPageConfig[
                                                    ManageableFieldsEnum.CARRIER_ID.name
                                                ]?.validations?.includes(ValidationsEnum.MANDATORY_FIELD.code)
                                                    ? `*${trans('label.carrierId')}`
                                                    : trans('label.carrierId')
                                            }
                                            entity="carrier_codes"
                                            maxSuggestions={pCmsConfig?.autoCompleteMaxCount}
                                            onSaveChangesClick={(_value) => pOnEdit('carrierId', _value)}
                                            value={pDetails}
                                            apiConfig={APIParams}
                                            dataTransformer={carrierStaticDataTransformer}
                                            minSearchTextLength={pCmsConfig?.autoCompleteMinSearchLength}
                                            config={{ disableSaveCancelBtn: true }}
                                            disabled={pPageConfig[ManageableFieldsEnum.CARRIER_ID.name]?.isDisable}
                                        />
                                    )}
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}

CarrierDetails.propTypes = {
    pDetails: PropTypes.shape({
        carrierId: PropTypes.string,
    }).isRequired,
    pOnEdit: PropTypes.func.isRequired,
    pPageConfig: PropTypes.shape({}).isRequired,
    pCmsConfig: PropTypes.shape({
        autoCompleteMaxCount: PropTypes.number,
        autoCompleteMinSearchLength: PropTypes.number,
    }).isRequired,
};
