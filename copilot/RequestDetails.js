import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UIRlogLoadTypeEnum, UILoadTypeEnum } from '@walmart/stride-ui-commons';
import { Card, CardContent, Typography, GroupedChips, Divider } from '@walmart/living-design-sc-ui';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
const { makeStyles, Grid } = MaterialUiCore,
    { localizeLang } = LocalizeLang.default;
const styles = makeStyles({
    chips: {
        textAlign: 'left',
        '& .ld-sc-ui-single-select-chip': {
            margin: 0,
            padding: 0,
            '&:first-child': {
                '& .ld-sc-ui-chip': {
                    borderRadius: '22px 0px 0px 22px',
                },
            },
            '&:nth-child(n+2) div': {
                borderRadius: 0,
                borderLeft: 'none',
            },
            '&:last-child': {
                '& .ld-sc-ui-chip': {
                    borderRadius: '0px 22px 22px 0px',
                    borderLeft: 'none',
                },
            },
        },
    },
});
export default function RequestDetails(props) {
    const { pDetails, pOnEdit, pStaticData, pFeatureFlags } = props;
    const trans = localizeLang();
    const classes = styles();
    const [sRequestTypes, setsRequestTypes] = useState([]);
    useEffect(() => {
        if (pStaticData?.requestTypes) {
            let filtedReqTypes = pStaticData.requestTypes?.filter(
                (obj) => obj.id === UIRlogLoadTypeEnum.PLT.name || obj.id === UIRlogLoadTypeEnum.CLM.name,
            );
            if (pFeatureFlags?.enableManualCreateLoadChanges) {
                let allowedLoadTypes = [];
                if (pFeatureFlags?.allowOnlySingleStopLoadTypes) {
                    allowedLoadTypes = [UILoadTypeEnum.PLT.name, UILoadTypeEnum.CLM.name];
                } else {
                    allowedLoadTypes = [
                        UILoadTypeEnum.PLT.name,
                        UILoadTypeEnum.CLM.name,
                        UILoadTypeEnum.STR.name,
                        UILoadTypeEnum.RTN.name,
                        UILoadTypeEnum.BOB.name,
                        UILoadTypeEnum.DHD.name,
                        UILoadTypeEnum.BOX.name,
                        UILoadTypeEnum.STK.name,
                        UILoadTypeEnum.WMGW.name,
                    ];
                    if (pFeatureFlags?.showGRSTR) {
                        allowedLoadTypes.push(UILoadTypeEnum.GRSTR.name);
                    }
                }
                filtedReqTypes = pStaticData?.requestTypes
                    ?.filter((obj) => allowedLoadTypes?.includes(obj.id))
                    ?.map((loadType) => ({ id: loadType.id, value: loadType.abbr }));
            }
            setsRequestTypes(filtedReqTypes);
        }
    }, [pStaticData, pFeatureFlags]);
    return (
        <>
            <Card elevation="3" size="standard">
                <div className="d-flex justify-content-between align-items-baseline py-1">
                    <Typography variant="h6" align="left" className="font-weight-bold p-3">
                        {trans('title.requestDetails')}
                    </Typography>
                </div>
                <Divider />
                <CardContent className="my-0 mx-0 p-3 w-100">
                    <Grid container spacing={2}>
                        <Grid container item spacing={2}>
                            <Grid item spacing={2} xs={6}>
                                <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                                    {pFeatureFlags?.enableManualCreateLoadChanges
                                        ? `*${trans('subTitle.requestType')}`
                                        : trans('subTitle.requestType')}
                                </Typography>
                                <div className={classes.chips}>
                                    <GroupedChips
                                        data-testid="requestTypes-chips"
                                        config={sRequestTypes?.map((requestType) => ({
                                            chipId: requestType.id,
                                            children: requestType.value,
                                            isSelected: pDetails?.requestType === requestType.id,
                                        }))}
                                        onChipClicked={(_e, id) => pOnEdit('requestType', id[0])}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}
RequestDetails.propTypes = {
    pDetails: PropTypes.shape({
        requestType: PropTypes.string,
    }).isRequired,
    pOnEdit: PropTypes.func.isRequired,
    pStaticData: PropTypes.shape({
        requestTypes: PropTypes.shape([]),
    }).isRequired,
    pFeatureFlags: PropTypes.shape({
        enableManualCreateLoadChanges: PropTypes.bool,
    }).isRequired,
};
