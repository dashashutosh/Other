import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from '../axios';
import {
    PageNavigation,
    useAPI,
    PageHeader,
    InlineAlert,
    isNullOrUndefined,
    ToastAction,
    ErrorBoundary,
    withStaticAndConfigDataHOC,
    StopSequenceDetails,
    getFeatureFlagsConfig,
    UILoadTypeEnum,
} from '@walmart/stride-ui-commons';
import { DrawerComponent, Button, Alert } from '@walmart/living-design-sc-ui';
import { useLocation } from 'react-router-dom';
import RequestDetails from './RequestDetails';
import LocationDetails from './LocationDetails';
import { PageLoadAPI, ServiceAPI, getAutoEntityAPIParams } from '../service/ServiceAPI';
import SharedService from '../service/SharedService';
import { transformCmsData, transformStaticData, validateCMSConfigData } from '../service/Mapper';
import { getErrorText } from '../utils/CommonUtils';
import { defaultFormValues, toastTimer, featureConfig, MODULE_NAME } from '../Constants';
import PermissionsEnum from '../utils/enums/PermissionsEnum';
import {
    formatLocationInfo,
    getCreateLoadRequest,
    getLocationSearchReq,
    applyValidations,
    handleErrRes,
} from './DataModels';
import useLoadSupportedLangs from '../hooks/useLoadSupportedLangs';
import { defaultMarketSettings, getMarketSettings } from '../utils/MarketSettings';
import CommentsCard from './CommentsCard';
import EquipmentDetails from './EquipmentDetails';
import ServiceDetails from './ServiceDetails';
import getFormConfigByLoadType from '../utils/LoadConfigs/CreateLoadConfigUtil';
import ManageableCardsEnum from '../utils/LoadConfigs/ManageableCardsEnum';
import { MaterialUiCore } from '@gscope-mfe/common-libs';
import { LocalizeLang } from '@gscope-mfe/common-components';
import { AppUtils } from '@gscope-mfe/app-bridge';
import { transformFormDataToAPIRequest } from '../service/CreateLoadServiceParams';
import CarrierDetails from './CarrierDetails';
import ManageableFieldsEnum from '../utils/LoadConfigs/ManageableFieldsEnum';
import ServiceLevelEnum from '../utils/LoadConfigs/ServiceLevelEnum';
import { canCreateLoad } from '../utils/PermissionsUtils';

const { Grid } = MaterialUiCore,
    { makeStyles } = MaterialUiCore,
    { localizeLang, localizeCommonLang } = LocalizeLang.default;
const useCreateLoadPageTitle = () => {
    const trans = localizeLang();
    return {
        pageTitle: trans('title.loadRequest'),
    };
};
const drawerWidth = '20em';
const styles = makeStyles({
    planToast: {
        '&.ld-sc-ui-toast--snack-bar': {
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            minWidth: 'max-content !important',
        },
        '& .ld-sc-ui-toast-container': {
            width: 'auto !important',
        },
    },
    toastMainText: {
        fontWeight: '700 !important',
    },
    toastSubText: {
        fontWeight: '400 !important',
        fontSize: '14px !important',
    },
    toastActionLink: {
        border: 'none !important',
        color: '#FFFFFF !important',
        paddingTop: '10px !important',
    },
    eqUeLeftGrid: {
        width: `calc(100% - ${drawerWidth}) !important`,
    },
    eqUeDrawer: {
        marginTop: '72px',
        // specified in pixel as Gscope header height is hardcoded
        width: drawerWidth,
        padding: '2rem 1rem',
        '&.MuiPaper-root': {
            border: 'none',
            background: 'unset',
        },
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
        zIndex: '998 !important',
        right: 0,
        left: '72px',
        width: 'unset !important',
    },
});
const loadNavListUs = [
    {
        id: 'requestDetails',
        label: 'label.requestDetails',
    },
    {
        id: 'locationDetails',
        label: 'label.locationDetails',
    },
];
function CreateRLogLoad(props) {
    const trans = localizeLang();
    const { pStaticData, pError: errorFromHOC, pCmsConfigData } = props;
    const { setBreadCrumbArr, currentMarket, setloading, prefLang, userInfo, loading } = AppUtils.get();
    const classes = styles();
    const { search } = useLocation();
    const commonTrans = localizeCommonLang();
    const activeCard = new URLSearchParams(search).get('section');
    const [sFormValue, setsFormValue] = useState();
    const [sIsDataInvalid, setsIsDataInvalid] = useState(false);
    const [sStaticData, setsStaticData] = useState(() => (pStaticData ? transformStaticData(pStaticData) : undefined));
    const [sCmsConfig, setsCmsConfig] = useState(pCmsConfigData);
    const [sIsSuccess, setsIsSuccess] = useState(false);
    const [sSelectedNav, setsSelectedNav] = useState(activeCard);
    const [sLoadNavList, setsLoadNavList] = useState([]);
    const [sNewLoadId, setsNewLoadId] = useState('');
    const [sError, setsError] = useState('');
    const requestDetailsRef = useRef(null);
    const locationDetailsRef = useRef(null);
    const equipmentDetailsRef = useRef(null);
    const carrierDetailsRef = useRef(null);
    const stopsequenceDetailsRef = useRef(null);
    const serviceDetailsRef = useRef(null);
    const commentsRef = useRef(null);
    const [sFeatureFlags, setsFeatureFlags] = useState();
    const [sPerm, setsPerm] = useState({});
    const pageConfig = useMemo(() => {
        return getFormConfigByLoadType(sFeatureFlags, sFormValue?.requestType);
    }, [sFormValue?.requestType, sFeatureFlags]);
    const { pageTitle } = useCreateLoadPageTitle();
    const sectionRefs = [
        {
            section: 'requestDetails',
            ref: requestDetailsRef,
        },
        {
            section: 'locationDetails',
            ref: locationDetailsRef,
        },
        { section: 'equipmentDetails', ref: equipmentDetailsRef },
        { section: 'stopsequenceDetails', ref: stopsequenceDetailsRef },
        { section: 'serviceDetails', ref: serviceDetailsRef },
        { section: 'comments', ref: commentsRef },
        { section: 'carrierDetails', ref: carrierDetailsRef },
    ];

    const APIParams = getAutoEntityAPIParams(currentMarket, prefLang.current, userInfo);

    useEffect(() => {
        if (sFeatureFlags) {
            const navList = [...loadNavListUs];
            if (sFeatureFlags?.enableManualCreateLoadChanges) {
                const index = navList?.findIndex((nav) => nav?.id === 'locationDetails');
                navList.splice(
                    index,
                    1,
                    { id: 'equipmentDetails', label: 'label.equipmentDetails' },
                    { id: 'stopsequenceDetails', label: 'label.stopsequenceDetails' },
                    { id: 'serviceDetails', label: 'label.serviceDetails' },
                    { id: 'comments', label: 'label.comments' },
                );
            }
            if (pageConfig?.sections[ManageableCardsEnum.CARRIER_DETAILS.name]) {
                navList.splice(2, 0, { id: 'carrierDetails', label: 'label.carrierDetails' });
            }
            setsLoadNavList(navList);
        }
    }, [sFeatureFlags, pageConfig]);

    const validateForm = () => {
        if (sFormValue) {
            if (sFormValue?.pickUpDT < new Date()) {
                return false;
            }
            return Object.values(sFormValue)?.every((value) => !isNullOrUndefined(value));
        }
        return false;
    };
    const { callAPI: fetchPageLoadData, ...pageLoadDataResponse } = useAPI(
        PageLoadAPI(currentMarket, prefLang.current, userInfo.loggedInUserName, userInfo.displayName).getPageLoadData,
    );
    const { callAPI: createLoadApi, ...createLoadApiResponse } = useAPI(
        ServiceAPI(currentMarket, prefLang.current, userInfo.loggedInUserName, userInfo.displayName).createLoad,
    );
    const { callAPI: createLoadApiV2, ...createLoadApiV2Response } = useAPI(
        ServiceAPI(currentMarket, prefLang.current, userInfo.loggedInUserName, userInfo.displayName).createLoadV2,
    );
    const { callAPI: locationTSSApi, ...locationTSSApiResponse } = useAPI(
        ServiceAPI(currentMarket, prefLang.current, userInfo.loggedInUserName, userInfo.displayName).locationTSSSearch,
    );
    const getPageLoadData = () => {
        if (!featureConfig.enableStaticAndConfigHoc) {
            fetchPageLoadData({
                data_elements: [
                    'time_zones_juris',
                    'master_equipment_types',
                    'equipment_lengths',
                    'modes',
                    'service_levels',
                ],
            });
        }
    };
    const setPageLoadData = () => {
        try {
            const {
                timeout,
                debounceTime,
                country,
                openLoadDelayTimeInMillisecs,
                autoCompleteMaxCount,
                autoCompleteMinSearchLength,
                featureFlags: flags,
                UOM,
                toastTimeout,
            } = transformCmsData(SharedService.getConfig());
            setsCmsConfig({
                timeout,
                debounceTime,
                country,
                openLoadDelayTimeInMillisecs,
                autoCompleteMaxCount,
                autoCompleteMinSearchLength,
                UOM,
                toastTimeout,
            });
            const featureFlagsForCR = getFeatureFlagsConfig(
                { hostname: window.location.hostname },
                {
                    cmsConfig: { featureFlags: flags },
                    marketConfig: getMarketSettings(currentMarket),
                    defaultConfig: defaultMarketSettings,
                },
            );
            SharedService.setFeatureFlags(featureFlagsForCR);
            setsStaticData(transformStaticData(SharedService.getStaticData()));
        } catch (e) {
            setsIsDataInvalid(true);
        }
    };

    useEffect(() => {
        if (pCmsConfigData) {
            const { featureFlags } = pCmsConfigData;
            SharedService.setFeatureFlags(featureFlags);
            setsFeatureFlags(featureFlags);
        }
    }, [pCmsConfigData]);

    useEffect(() => {
        if (sFeatureFlags) {
            setsFormValue(defaultFormValues(sFeatureFlags, pageConfig));
        }
    }, [sFeatureFlags]);

    useEffect(() => {
        setBreadCrumbArr([]);
        if (prefLang.current) {
            if (!SharedService.getConfig() || !SharedService.getFeatureFlags() || !SharedService.getStaticData()) {
                getPageLoadData();
            } else {
                setPageLoadData();
            }
            if (isNullOrUndefined(SharedService.getUserPermissions())) {
                const userPerm = JSON.parse(localStorage.getItem('ngStorage-permissionData'));
                SharedService.setUserPermissions(userPerm?.permissions);
            }
            setsPerm({
                canCreateLoad: canCreateLoad(SharedService.getUserPermissions(), currentMarket),
            });
        }
    }, [prefLang.current]);

    useEffect(() => {
        if (featureConfig.enableStaticAndConfigHoc) {
            const hocErrorMsgs = [];
            Object.values(errorFromHOC || {})
                ?.filter(Boolean)
                ?.forEach((err) => {
                    hocErrorMsgs.push(getErrorText(err, trans));
                });
            if (hocErrorMsgs.length > 0) {
                setsError(hocErrorMsgs.join('\r\n'));
            }
        }
    }, [errorFromHOC]);

    const onValueChange = (field, value, stopIndex = undefined) => {
        if (sFeatureFlags?.enableManualCreateLoadChanges) {
            if (stopIndex === undefined) {
                if (field === 'equipmentType' || field === 'equipmentLength' || field === 'equipmentId') {
                    setsFormValue((formValue) => ({
                        ...formValue,
                        equipment: { ...formValue?.equipment, [field]: value },
                    }));
                } else if (field === 'mode' || field === 'serviceLevel') {
                    setsFormValue((formValue) => ({
                        ...formValue,
                        transitDetail: { ...formValue?.transitDetail, [field]: value },
                    }));
                } else if (field === 'requestType') {
                    let updatedFormValues = { ...sFormValue };
                    if (value !== UILoadTypeEnum.GRSTR.name) {
                        if (updatedFormValues?.transitDetail?.serviceLevel === ServiceLevelEnum.DEDF.name) {
                            updatedFormValues = {
                                ...updatedFormValues,
                                transitDetail: {
                                    ...updatedFormValues?.transitDetail,
                                    serviceLevel: pageConfig?.fields[ManageableFieldsEnum.LEVEL.name]?.defaultValue,
                                },
                            };
                        }
                        updatedFormValues = {
                            ...updatedFormValues,
                            [field]: value,
                            carrierId: pageConfig?.fields[ManageableFieldsEnum.CARRIER_ID.name]?.defaultValue,
                        };
                    } else {
                        updatedFormValues = { ...updatedFormValues, [field]: value };
                    }
                    setsFormValue(updatedFormValues);
                } else setsFormValue((formValue) => ({ ...formValue, [field]: value }));
            } else {
                const { stops } = sFormValue;
                stops[stopIndex][field] = value;
                setsFormValue((formValue) => ({ ...formValue, stops }));
                if (field.includes('locationId') && value) {
                    const locObj = value;
                    const idLoc = locObj?.id.toString();
                    const loc = idLoc?.split(' - ');
                    let locid = loc?.[1]?.trim();
                    locid = parseInt(locid, 10);

                    locObj.id = locid;
                    const locationSearchReq = getLocationSearchReq(locObj, currentMarket);
                    locationTSSApi(
                        locationSearchReq,
                        (res) => {
                            stops[stopIndex][`${field}Info`] = formatLocationInfo(res?.payload?.locations?.[0]);
                            setsFormValue((formValue) => ({ ...formValue, stops }));
                        },
                        () => {
                            setsError(trans('locationDetails.error'));
                            stops[stopIndex][`${field}Info`] = null;
                            setsFormValue((formValue) => ({ ...formValue, stops }));
                        },
                    );
                }
            }
        } else {
            setsFormValue((formValue) => ({ ...formValue, [field]: value }));
            if (field.includes('LocationId') && value) {
                const locationSearchReq = getLocationSearchReq(value, currentMarket);
                locationTSSApi(
                    locationSearchReq,
                    (res) => {
                        setsFormValue((formValue) => ({
                            ...formValue,
                            [`${field}Info`]: formatLocationInfo(res?.payload?.locations?.[0]),
                        }));
                    },
                    () => {
                        setsError(trans('locationDetails.error'));
                        setsFormValue((formValue) => ({ ...formValue, [`${field}Info`]: null }));
                    },
                );
            }
        }
    };
    const resetForm = () => {
        setsFormValue(defaultFormValues(sFeatureFlags, pageConfig));
    };
    const validations = useMemo(() => {
        if (pageConfig) {
            const validationsList = [];
            // eslint-disable-next-line no-unused-expressions
            Object.values(pageConfig?.sections)?.forEach((value) => {
                if (value?.validations?.length) {
                    validationsList.push(...value?.validations);
                }
            });
            return validationsList;
        }
        return [];
    }, [pageConfig]);

    const validateFormData = () => {
        if (!sFeatureFlags?.enableManualCreateLoadChanges) {
            return validateForm();
        }
        return applyValidations(validations, sFormValue, sFeatureFlags, pageConfig)?.result;
    };
    const handleSubmit = () => {
        let request;
        if (!sFeatureFlags?.enableManualCreateLoadChanges) {
            request = getCreateLoadRequest(sFormValue);
            createLoadApi(
                request,
                (res) => {
                    if (res?.payload?.length && res?.payload[0]?.identifiers?.planId) {
                        setsNewLoadId(res?.payload[0]?.identifiers?.planId);
                        setsIsSuccess(true);
                    }
                },
                (e) => {
                    if (e?.errors?.length && e?.errors[0]?.errorIdentifiers?.details?.errors) {
                        setsError(e?.errors[0]?.errorIdentifiers?.details?.errors);
                    } else {
                        setsError(e);
                    }
                },
            );
        } else {
            const uom = sCmsConfig?.UOM ? JSON.parse(sCmsConfig.UOM) : {};
            request = transformFormDataToAPIRequest(sFormValue, uom);
            createLoadApiV2(
                request,
                (res) => {
                    if (res?.payload?.length && res?.payload[0]?.identifiers?.planId) {
                        setsNewLoadId(res?.payload[0]?.identifiers?.planId);
                        setsIsSuccess(true);
                        resetForm();
                    }
                },
                (e) => {
                    const error = handleErrRes(e, trans);
                    setsError(error);
                },
            );
        }
    };
    useEffect(() => {
        try {
            if (pageLoadDataResponse?.response && pageLoadDataResponse?.response?.length === 2) {
                SharedService.setConfig(pageLoadDataResponse?.response[0]);
                SharedService.setStaticData(pageLoadDataResponse?.response[1], prefLang.current);
                setPageLoadData();
            }
        } catch (e) {
            setsIsDataInvalid(true);
        }
    }, [pageLoadDataResponse.response]);
    useEffect(() => {
        if (sSelectedNav && !sIsDataInvalid && sStaticData) {
            const navRef = sectionRefs.find((section) => section.section === sSelectedNav);
            if (navRef.ref.current) {
                navRef.ref.current.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        }
    }, [sSelectedNav, sStaticData, sIsDataInvalid]);
    useEffect(() => {
        const isLoading =
            pageLoadDataResponse.loading ||
            createLoadApiResponse.loading ||
            createLoadApiV2Response.loading ||
            locationTSSApiResponse.loading;
        if (loading) {
            if (!isLoading) {
                setloading(false);
            }
        } else if (isLoading) {
            setloading(true);
        }
    }, [
        pageLoadDataResponse.loading,
        createLoadApiResponse.loading,
        createLoadApiV2Response.loading,
        locationTSSApiResponse.loading,
    ]);

    const handleCommentsUpdateResponse = useCallback((commentsResponseData) => {
        setsFormValue((formValue) => ({ ...formValue, comments: commentsResponseData }));
    }, []);

    const handleShowDeleteReorder = useCallback((stopsList) => {
        const stops = stopsList?.length ? [...stopsList] : [];
        let stopsUpdated = [];
        if (stops?.length === 2) {
            stopsUpdated = stops?.map((stop) => ({ ...stop, canDeleteStop: false, canReorderStop: false }));
        } else {
            stopsUpdated = stops?.map((stop, index) => {
                if (index === 0) return { ...stop };
                return { ...stop, canDeleteStop: true, canReorderStop: true };
            });
        }
        return stopsUpdated;
    }, []);

    const getHeaderChildren = () => {
        const headerChildren = (
            <>
                <div>
                    <Button
                        variant="text-only"
                        onClick={() => {
                            resetForm();
                        }}
                        data-testid="cancelBtn"
                    >
                        {trans('button.cancel')}
                    </Button>
                </div>
                <div>
                    <Button
                        disabled={!validateFormData() || sError}
                        variant="primary"
                        data-testid="submitBtn"
                        onClick={() => {
                            handleSubmit();
                        }}
                    >
                        {trans('button.submitRequest') || 'Submit request'}
                    </Button>
                </div>
            </>
        );
        if (sFeatureFlags?.enablePermissions) {
            if (sPerm?.canCreateLoad) {
                return headerChildren;
            } else return <></>;
        } else {
            return headerChildren;
        }
    };

    return (
        <div ref={requestDetailsRef}>
            <PageHeader
                pTitle={pageTitle}
                useAppContextHook={() => AppUtils.get()}
                pCommonTrans={commonTrans}
                pHideProfileButton
                pClassName={classes.stickyHeader}
            >
                <PageHeader.Content placement="right">{getHeaderChildren()}</PageHeader.Content>
            </PageHeader>
            {sIsSuccess && (
                <ToastAction
                    pVariant="positive"
                    pText={
                        sFeatureFlags?.showLoadIdInToast
                            ? `${trans('msg.createLoadSuccess')}: ${sNewLoadId}`
                            : trans('msg.createLoadSuccess')
                    }
                    pSubText={trans('msg.createLoadSubText')}
                    pLinkText={trans('toast.actionLinkText')}
                    pOnLinkClick={() => {
                        setloading(true);
                        setTimeout(() => {
                            setloading(false);
                            window.open(`/mfe/stride/planquery/loaddetails?planId=${sNewLoadId}`);
                        }, sCmsConfig.openLoadDelayTimeInMillisecs);
                    }}
                    pOnClose={() => {
                        setsIsSuccess(false);
                    }}
                    pDelay={sCmsConfig.toastTimeout}
                />
            )}

            <Grid
                container
                direction="row"
                data-testid="create-rlog-load-container"
                data-loading={locationTSSApiResponse.loading}
            >
                <Grid container item spacing={2} className={`p-3 m-0 ${classes.eqUeLeftGrid}`}>
                    {pageLoadDataResponse.error && (
                        <div className="w-100">
                            <Alert variant="error" action={getPageLoadData} actionText={trans('button.retry')}>
                                {trans('API.error.getConfigGetStaticData')}
                            </Alert>
                        </div>
                    )}
                    {sError && (
                        <div className="w-100">
                            <Alert
                                variant="error"
                                onClose={() => {
                                    setsError('');
                                }}
                            >
                                {getErrorText(sError, trans)}
                            </Alert>
                        </div>
                    )}
                    {sStaticData && !sIsDataInvalid && sCmsConfig && sFormValue && (
                        <>
                            <div className="w-100 px-2">
                                <InlineAlert pVariant="info" pMessage={trans('info.createLoad')} />
                            </div>
                            <Grid container item xs={12}>
                                <div className="w-100 text-left">
                                    <RequestDetails
                                        pDetails={sFormValue}
                                        pOnEdit={onValueChange}
                                        pStaticData={sStaticData}
                                        pFeatureFlags={sFeatureFlags}
                                    />
                                </div>
                            </Grid>
                            {sFeatureFlags?.enableManualCreateLoadChanges &&
                                pageConfig?.sections[ManageableCardsEnum.EQUIPMENT_DETAILS.name] && (
                                    <Grid
                                        container
                                        item
                                        xs={pageConfig?.sections[ManageableCardsEnum.CARRIER_DETAILS.name] ? 8 : 12}
                                        ref={equipmentDetailsRef}
                                    >
                                        <div className="w-100 text-left">
                                            <EquipmentDetails
                                                pDetails={sFormValue?.equipment}
                                                pOnEdit={onValueChange}
                                                pStaticData={sStaticData}
                                                pUOM={sCmsConfig?.UOM ? JSON.parse(sCmsConfig.UOM) : {}}
                                                pPageConfig={pageConfig?.fields}
                                            />
                                        </div>
                                    </Grid>
                                )}
                            {pageConfig?.sections[ManageableCardsEnum.CARRIER_DETAILS.name] && (
                                <Grid container item xs={4} ref={carrierDetailsRef}>
                                    <div className="w-100 text-left">
                                        <CarrierDetails
                                            pDetails={sFormValue.carrierId}
                                            pOnEdit={onValueChange}
                                            pPageConfig={pageConfig?.fields}
                                            pCmsConfig={sCmsConfig}
                                        />
                                    </div>
                                </Grid>
                            )}
                            {sFeatureFlags?.enableManualCreateLoadChanges &&
                            pageConfig?.sections[ManageableCardsEnum.STOP_SEQUENCE.name] ? (
                                <Grid container item xs={12} ref={stopsequenceDetailsRef}>
                                    <div className="w-100 text-left">
                                        <StopSequenceDetails
                                            pDetails={sFormValue?.stops}
                                            pOnEdit={onValueChange}
                                            pStaticData={sStaticData}
                                            pCmsConfig={sCmsConfig}
                                            pUseAppContext={() => AppUtils.get()}
                                            pApiConfig={APIParams}
                                            pLoadType={sFormValue?.requestType}
                                            pValidator={handleShowDeleteReorder}
                                            pShowDeliveryDt={sFeatureFlags?.showFinalDeliveryDate}
                                        />
                                    </div>
                                </Grid>
                            ) : (
                                <Grid container item xs={12} ref={locationDetailsRef}>
                                    <div className="w-100 text-left">
                                        <LocationDetails
                                            pDetails={sFormValue}
                                            pOnEdit={onValueChange}
                                            pStaticData={sStaticData}
                                            pCmsConfig={sCmsConfig}
                                        />
                                    </div>
                                </Grid>
                            )}
                            {sFeatureFlags?.enableManualCreateLoadChanges &&
                                pageConfig?.sections[ManageableCardsEnum.SERVICE_DETAILS.name] && (
                                    <Grid container item xs={12} ref={serviceDetailsRef}>
                                        <div className="w-100 text-left">
                                            <ServiceDetails
                                                pDetails={sFormValue?.transitDetail}
                                                pOnEdit={onValueChange}
                                                pStaticData={sStaticData}
                                                pPageConfig={pageConfig}
                                                pLoadType={sFormValue?.requestType}
                                                pCarrier={sFormValue?.carrierId}
                                            />
                                        </div>
                                    </Grid>
                                )}
                            {sFeatureFlags?.enableManualCreateLoadChanges &&
                                pageConfig?.sections[ManageableCardsEnum.COMMENTS.name] && (
                                    <Grid container item xs={12} ref={commentsRef}>
                                        <div className="w-100 text-left">
                                            <CommentsCard
                                                pComments={sFormValue?.comments || []}
                                                pEditable
                                                pOnUpdateResponse={handleCommentsUpdateResponse}
                                            />
                                        </div>
                                    </Grid>
                                )}
                        </>
                    )}
                </Grid>
                <Grid container item xs={6}>
                    <DrawerComponent
                        variant="persistent"
                        position="right"
                        open
                        classes={{
                            paper: classes.eqUeDrawer,
                        }}
                        className="pr-2"
                    >
                        <PageNavigation
                            navList={sLoadNavList.map((nav) => ({
                                ...nav,
                                name: trans(nav.label),
                            }))}
                            onNavItemClick={(id) => {
                                setsSelectedNav(id);
                            }}
                            selectedNavItem={sSelectedNav || 'requestDetails'}
                        />
                    </DrawerComponent>
                </Grid>
            </Grid>
        </div>
    );
}
let EnhancedCreateRLogLoad = CreateRLogLoad;
if (featureConfig.enableStaticAndConfigHoc) {
    const getMDMStaticDataRequest = () => ({
        data_elements: ['time_zones_juris', 'master_equipment_types', 'equipment_lengths', 'modes', 'service_levels'],
    });
    const appContext = () => AppUtils.get();
    const obj = {
        useAppContext: appContext,
        moduleName: MODULE_NAME,
        staticDataConfigs: {
            ltm: {},
            mdm: { getRequest: getMDMStaticDataRequest },
        },
        axios,
        usePageTitle: useCreateLoadPageTitle,
        // validateCCMConfigData,
        // errorOutputMode: 'self',
        validateCMSConfigData,
        cmsPath: '/stride/create-load',
        serviceType: 'cms',
        marketConfig: getMarketSettings(appContext()?.currentMarket),
        defaultConfig: defaultMarketSettings,
        // disableCache: true,
    };
    EnhancedCreateRLogLoad = withStaticAndConfigDataHOC(CreateRLogLoad, obj);
}
export default (props) => {
    const { currentMarket } = AppUtils.get();
    const trans = useLoadSupportedLangs(currentMarket);
    return (
        <ErrorBoundary
            pPageTitle={trans('title.loadRequest')}
            pUseAppContextHook={() => AppUtils.get()}
            pDefaultErrorTitle={trans('msg.defaultError')}
        >
            <EnhancedCreateRLogLoad {...props} />
        </ErrorBoundary>
    );
};

CreateRLogLoad.propTypes = {
    pCmsConfigData: PropTypes.shape({}),
    pStaticData: PropTypes.shape({}),
    pError: PropTypes.shape({}),
};
CreateRLogLoad.defaultProps = {
    pCmsConfigData: null,
    pStaticData: null,
    pError: null,
};
