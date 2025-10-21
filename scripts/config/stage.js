/* eslint-disable import/prefer-default-export */
const orgId = '11B20CF953F3626B0A490D44@AdobeOrg';
const dataLayerInstanceName = 'digitalDataLayer';

export const config = {
  global: {
    env: 'stage',
    orgId,
    dataLayerInstanceName,
    cs_prefix: '/content-services/',
  },

  dam: {
    useAkamai: false, // This is a toggle to switch between Adobe and Akamai for testing.
    url: '/dynamic-assets/',
    domain: '', // use relative path if empty
  },

  martech: {
    datalayer: {
      instanceName: 'digitalDataLayer',
    },
    websdk: {
      datastreamId: '0150244e-802c-4117-a94d-16c6a5347b47',
      orgId: '11B20CF953F3626B0A490D44@AdobeOrg',
      clickCollectionEnabled: true,
      clickCollection: {
        internalLinkEnabled: true,
        downloadLinkEnabled: true,
        externalLinkEnabled: true,
        eventGroupingEnabled: true,
        sessionStorageEnabled: true,
      },
      context: ['web', 'device', 'environment'],
      debugEnabled: true,
      defaultConsent: 'pending',
    },
    martech: {
      analytics: true,
      alloyInstanceName: 'alloy',
      dataLayer: true,
      dataLayerInstanceName: 'adobeDataLayer',
      includeDataLayerState: true,
      launchUrls: ['/scripts/martech/libraries/launch-938059e83191-staging.min.js'],
      personalization: false,
      performanceOptimized: true,
      personalizationTimeout: 1000,
      libraries: {
        datadog: {
          scriptUrl:
            'https://static.qantas.com/ams02/a1055/12/prod/master/dd-rum/current/app.js',
          applicationId: '64131345-3608-4a8f-bc75-c09c52a48005',
          clientToken: 'pubd8d753935a175560c970bdc1187fd18e',
          site: 'datadoghq.com',
          service: 'qantas.com',
          env: 'production',
          sessionSampleRate: 100,
          sessionReplaySampleRate: 25,
          trackUserInteractions: true,
          defaultPrivacyLevel: 'mask',
        },
        onetrust: {
          scriptUrl: 'https://cdn-au.onetrust.com/scripttemplates/otSDKStub.js',
          documentLanguage: 'true',
          domainScript: '61f87739-ab7a-414b-8394-41417cec53cb',
        },
        optimizely: {
          scriptUrl: 'https://cdn.optimizely.com/js/5729657726173184.js',
        },
      },
    },
  },

  site: {
    hero: {},
    breadcrumb: {},
  },

  widgets: {
    env: 'staging',
    login: {
      oauthInitBundleUri:
        'https://cdn.stg.qantasloyalty.com/appcache/qfa-qff-oauth-login/master/0.0.0/oauth.js',
      oauthBundleUri:
        'https://cdn.stg.qantasloyalty.com/appcache/qdd-oauth-login/master/0.0.0/bundle.js',
      oauthLoginRibbonBundleUri:
        'https://cdn.stg.qantasloyalty.com/appcache/qdd-login-ribbon/master/25.717.1561/bundle.js',
    },
    shopping_cart: {
      scriptPath:
        'https://static.qcom-stg.qantastesting.com/ams02/a974/62/dev/eds-master/shoppingcart_widget/current/app.js',
    },
  },
};
