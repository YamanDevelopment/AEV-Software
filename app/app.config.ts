// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: 'FAUHS AEV Software',
    description: 'The documentation for FAU High Schools AEV Solar Cybersedan software.',
    url: 'https://AEVSoftware.zachl.tech',
    image: 'https://lh3.googleusercontent.com/pw/AP1GczOVEOB9fxSK5_kWNwhEwoqrF5Q33Zd0Zfq_mojGlGunEdm_aQdZP_Xx8BeTqE9nwi9n3j4RV_CCSwu23JSyyQDebpiqMwFrmQWAjT3JOyjhVsct20uakP85b0TSkvcvBHKnGEzKHksgKCn0bmfZ6SC7Hg=w2111-h1583-s-no-gm?authuser=2',
    socials: {
      twitter: 'aev_fauhs',
      instagram: 'aev.fauhigh',
      github: 'YamanDevelopment/AEV-Software'
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: []
    },
    main: {
      padded: false,
      fluid: true
    },
    header: {
      logo: false,
      title: 'AEV Dash',
      showLinkIcon: true,
      exclude: [],
      fluid: true
    }
  }
})
