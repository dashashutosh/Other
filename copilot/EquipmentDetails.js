import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Divider, SingleSelect, TextInput } from '@walmart/living-design-sc-ui';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
import { formatEquipmentLengths } from './DataModels';
import ManageableFieldsEnum from '../utils/LoadConfigs/ManageableFieldsEnum';
import ValidationsEnum from '../utils/LoadConfigs/ValidationsEnum';
const { makeStyles, Grid } = MaterialUiCore,
    { localizeLang } = LocalizeLang.default;

const styles = makeStyles({
    chips: {
        textAlign: 'left',
        '& .ld-sc-ui-select-label': {
            margin: 10,
            padding: 10,
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
    equipId: {
        '&.ld-sc-ui-textinput-wrapper': {
            width: '275px',
            marginLeft: '5px',
        },
    },
});

export default function EquipmentDetails(props) {
    const { pDetails, pOnEdit, pStaticData, pUOM, pPageConfig } = props;
    const trans = localizeLang();
    const classes = styles();

    const equipmentLengthOptions = useMemo(() => {
        if (pStaticData && pUOM) {
            return formatEquipmentLengths(pStaticData?.equipmentLengths, pUOM?.length);
        }
        return [];
    }, [pStaticData, pUOM]);

    return (
        <>
            <Card elevation="3" size="standard">
                <div className="d-flex justify-content-between align-items-baseline py-1">
                    <Typography variant="h6" align="left" className="font-weight-bold p-3">
                        {trans('title.equipmentDetails')}
                    </Typography>
                </div>
                <Divider />
                <CardContent className="my-0 mx-0 p-3 w-100">
                    <Grid container spacing={2}>
                        <Grid container item spacing={2}>
                            <Grid item spacing={2} xs={12}>
                                <div className={classes.chips}>
                                    {pPageConfig[ManageableFieldsEnum.EQUIPMENT_TYPE.name] && (
                                        <SingleSelect
                                            id="equipmentType"
                                            key="equipmentType"
                                            label={
                                                pPageConfig[
                                                    ManageableFieldsEnum.EQUIPMENT_TYPE.name
                                                ]?.validations?.includes(ValidationsEnum.MANDATORY_FIELD.code)
                                                    ? `*${trans('label.equipmentType')}`
                                                    : trans('label.equipmentType')
                                            }
                                            value={pDetails?.equipmentType}
                                            onChange={(_e) => pOnEdit('equipmentType', _e.target.getAttribute('value'))}
                                            options={pStaticData?.equipmentTypes}
                                            data-testid="equipmentType"
                                        />
                                    )}
                                    {pPageConfig[ManageableFieldsEnum.EQUIPMENT_LENGTH.name] && (
                                        <SingleSelect
                                            id="equipmentLength"
                                            key="equipmentLength"
                                            label={
                                                pPageConfig[
                                                    ManageableFieldsEnum.EQUIPMENT_LENGTH.name
                                                ]?.validations?.includes(ValidationsEnum.MANDATORY_FIELD.code)
                                                    ? `*${trans('label.equipmentLength')}`
                                                    : trans('label.equipmentLength')
                                            }
                                            value={pDetails?.equipmentLength}
                                            onChange={(_e) =>
                                                pOnEdit('equipmentLength', _e.target.getAttribute('value'))
                                            }
                                            options={equipmentLengthOptions}
                                            data-testid="equipmentLength"
                                        />
                                    )}
                                    {pPageConfig[ManageableFieldsEnum.EQUIPMENT_ID.name] && (
                                        <TextInput
                                            id="equipmentId"
                                            label={
                                                pPageConfig[
                                                    ManageableFieldsEnum.EQUIPMENT_ID.name
                                                ]?.validations?.includes(ValidationsEnum.MANDATORY_FIELD.code)
                                                    ? `*${trans('label.equipmentID')}`
                                                    : trans('label.equipmentID')
                                            }
                                            type="text"
                                            value={pDetails?.equipmentId}
                                            onChange={(e) => pOnEdit('equipmentId', e.target.value)}
                                            data-testid="equipmentId"
                                            className={classes.equipId}
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

EquipmentDetails.propTypes = {
    pDetails: PropTypes.shape({
        equipmentType: PropTypes.string,
        equipmentLength: PropTypes.string,
        equipmentId: PropTypes.string,
    }).isRequired,
    pOnEdit: PropTypes.func.isRequired,
    pStaticData: PropTypes.shape({
        equipmentTypes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        equipmentLengths: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
    pUOM: PropTypes.shape({
        length: PropTypes.string,
    }).isRequired,
    pPageConfig: PropTypes.shape({}).isRequired,
};
