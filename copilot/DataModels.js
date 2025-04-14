import {
    convertToISOStringWithOffset,
    getTenant,
    convertLength,
    getUniqueObjectValuesSorted,
    isNullOrUndefined,
} from '@walmart/stride-ui-commons';
import { EQUIPMENT_LENGTH_DECIMAL_COUNT } from '../Constants';
import ValidationsEnum from '../utils/LoadConfigs/ValidationsEnum';
import { getErrorText } from '../utils/CommonUtils';
import ManageableFieldsEnum from '../utils/LoadConfigs/ManageableFieldsEnum';

export const locationStaticDataTransformer = (err, res) => {
    let data = [];
    if (err) {
        return {
            error: 'Error while fetching the data',
        };
    }
    if (res?.payload?.static_data?.locations) {
        data = res.payload.static_data.locations.map((location) => ({
            id: location.location_id,
            value: `${location.location_type_code} - ${location.location_id}`,
            locationType: location.location_type_code,
        }));
    }
    return {
        data,
    };
};
export const getLocationSearchReq = (data, market) => {
    const tenantHeaderValue = getTenant(market, {
        hostname: window.location.hostname,
        usUsTenant: true,
    });
    return {
        query: `{ location_by_field(tenant_id: ${tenantHeaderValue},location_id:[${data?.id}],location_type_code:[${data?.locationType}],page: 1,is_total_records_needed: true){}}`,
    };
};
export const formatLocationInfo = (locInfo) => ({
    address: {
        countryCode: locInfo?.address?.[0]?.country_code,
    },
    timeZoneInfo: {
        olsenTimezoneId: locInfo?.time_zone_info?.olsen_timezone_id,
        timeZoneCode: locInfo?.time_zone_info?.time_zone_code,
    },
});
export const getComments = (comments) => {
    const commentsList = [];
    if (Array.isArray(comments)) {
        comments.forEach((comment) =>
            // TODO: check what are mandatory/Optional fields after receiving API contract.
            commentsList.push({
                commentId: comment?.commentId || null,
                commentText: comment?.commentText || '',
                createdByUserId: comment?.commentBy || '',
                createdTs: comment?.createdTs || '', // TODO: check if UI needs to pass this
                lastUpdatedTs: comment?.lastUpdatedTs ? comment?.lastUpdatedTs : comment?.createdTs || '', // TODO: check if UI needs to pass this
                commentType: comment?.commentType || '', // TODO: check if UI needs to pass this
            }),
        );
    }
    return commentsList;
};

export const getCreateLoadRequest = (formData) => ({
    payload: {
        requesterInfo: {
            requesterType: 'UI',
        },
        plans: [
            {
                planCategory: formData?.requestType,
                locations: {
                    origin: {
                        locationId: formData?.originLocationId?.id,
                        locationType: formData?.originLocationId?.locationType,
                        countryCode: formData?.originLocationIdInfo?.address?.countryCode,
                    },
                    destination: {
                        locationId: formData?.destLocationId?.id,
                        locationType: formData?.destLocationId?.locationType,
                        countryCode: formData?.destLocationIdInfo?.address?.countryCode,
                    },
                },
                stops: [
                    {
                        stopType: '3',
                        location: {
                            locationId: formData?.originLocationId?.id,
                            locationType: formData?.originLocationId?.locationType,
                            countryCode: formData?.originLocationIdInfo?.address?.countryCode,
                        },
                        stopActivityType: 'PickLoaded',
                        stopSequenceNumber: 1,
                    },
                    {
                        stopType: '7',
                        location: {
                            locationId: formData?.destLocationId?.id,
                            locationType: formData?.destLocationId?.locationType,
                            countryCode: formData?.destLocationIdInfo?.address?.countryCode,
                        },
                        stopActivityType: 'DropLoaded',
                        stopSequenceNumber: 2,
                    },
                ],
                schedule: {
                    minPickupTs: convertToISOStringWithOffset(
                        formData?.pickUpDT,
                        formData?.originLocationIdInfo?.timeZoneInfo?.olsenTimezoneId,
                    ),
                },
            },
        ],
    },
});

export const formatEquipmentLengths = (equipmentLengths, equipmentLengthUom) => {
    const formattedEquipmentLengths = [];
    if (!Array.isArray(equipmentLengths)) return [];
    equipmentLengths.forEach((equipmentLength) => {
        const { valueInStr, uomName } = convertLength({
            inputValue: equipmentLength?.value,
            inputUom: equipmentLength?.uom,
            outputUom: equipmentLengthUom,
            outputDecimals: EQUIPMENT_LENGTH_DECIMAL_COUNT,
        });
        const convertedLength = valueInStr ? parseInt(valueInStr, 10) : null;
        formattedEquipmentLengths.push({
            id: convertedLength.toString(),
            value: `${convertedLength} ${uomName.toLowerCase()}`,
            uom: uomName,
        });
    });
    return getUniqueObjectValuesSorted(formattedEquipmentLengths);
};

export const applyValidations = (validations, formData, featureFlags, pageConfig) => {
    if (formData) {
        if (validations?.includes(ValidationsEnum.PICKUP_DATE_CANNOT_BE_IN_PAST.code)) {
            if (formData?.stops?.length && formData?.stops[0]?.pickUpDT && formData?.stops[0]?.pickUpDT < new Date()) {
                return {
                    result: false,
                    reason: ValidationsEnum.PICKUP_DATE_CANNOT_BE_IN_PAST.desc,
                };
            }
        }

        if (validations?.includes(ValidationsEnum.DELIVERY_DATE_CANNOT_BE_IN_PAST.code)) {
            if (
                formData?.stops?.length &&
                formData?.stops[formData?.stops?.length - 1]?.finalDeliveryDT &&
                formData?.stops[formData?.stops?.length - 1]?.finalDeliveryDT < new Date()
            ) {
                return {
                    result: false,
                    reason: ValidationsEnum.DELIVERY_DATE_CANNOT_BE_IN_PAST.desc,
                };
            }
        }
        const getDateFieldMandatory = featureFlags?.showFinalDeliveryDate
            ? formData?.stops?.[0]?.pickUpDT || formData?.stops?.[formData?.stops?.length - 1]?.finalDeliveryDT
            : formData?.stops?.[0]?.pickUpDT;
        // apply other validations based on the load type config
        const mandatoryValues = [
            formData?.requestType,
            formData?.equipment?.equipmentType,
            formData?.equipment?.equipmentLength,
            getDateFieldMandatory,
            pageConfig?.fields[ManageableFieldsEnum.CARRIER_ID.name]?.validations?.includes(
                ValidationsEnum.MANDATORY_FIELD.code,
            )
                ? formData?.carrierId
                : '',
        ];
        const result =
            mandatoryValues?.every((value) => !isNullOrUndefined(value)) &&
            formData?.stops?.every((stop) => !isNullOrUndefined(stop?.locationId));
        return {
            result,
            reason: result ? '' : ValidationsEnum.MANDATORY_FIELD.desc,
        };
    }
    return {
        result: false,
        reason: 'label.validation.emptyFormdata',
    };
};

export const handleErrRes = (e, trans) => {
    let errors = [];
    let errMsg = '';
    if (e?.errors?.length && e?.errors[0]?.errorIdentifiers?.details?.errors) {
        errors = e?.errors[0]?.errorIdentifiers?.details?.errors;
        const errorText = getErrorText(errors, trans, { concatDesc: true });
        errMsg = errorText?.length < 80 ? errorText : trans('API.error.plan.creation');
    } else if (e?.errors?.length && e?.errors[0]?.errorIdentifiers?.details?.toResponse?.errors?.length) {
        errors = e?.errors[0]?.errorIdentifiers?.details?.toResponse?.errors;
        const errorText = getErrorText(errors, trans, { concatDesc: true });
        errMsg = errorText?.length < 80 ? errorText : trans('API.error.to.creation');
    } else if (e?.errors?.length && e?.errors[0]?.errorIdentifiers?.details?.shipmentResponse?.errors?.length) {
        errors = e?.errors[0]?.errorIdentifiers?.details?.shipmentResponse?.errors;
        const errorText = getErrorText(errors, trans, { concatDesc: true });
        errMsg = errorText?.length < 80 ? errorText : trans('API.error.shipment.creation');
    } else if (e?.errors?.length && e?.errors[0]?.errorIdentifiers?.details?.planResponse?.errors?.length) {
        errors = e?.errors[0]?.errorIdentifiers?.details?.planResponse?.errors;
        const errorText = getErrorText(errors, trans, { concatDesc: true });
        errMsg = errorText?.length < 80 ? errorText : trans('API.error.plan.creation');
    } else {
        errMsg = getErrorText(e, trans);
    }
    return errMsg;
};

export const carrierStaticDataTransformer = (err, res) => {
    let data = [];
    if (err) {
        return {
            error: 'Error while fetching the data',
        };
    }
    if (res?.payload?.static_data?.carrier_codes) {
        data = res.payload.static_data.carrier_codes.map((carrier) => ({
            id: carrier.carrier_id,
            value: `${carrier.carrier_id} - ${carrier.carrier_name}`,
        }));
    }
    return {
        data,
    };
};
