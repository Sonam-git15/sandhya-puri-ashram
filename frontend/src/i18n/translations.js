// Tri-lingual translations. Navigation labels & button labels are ALWAYS English
// regardless of selected language (per requirements). Only body content switches.

const translations = {
    hi: {
        // Hero
        hero_heading: 'एक पवित्र स्थान शांति और आध्यात्मिक विकास के लिए',
        hero_sub: 'संध्या पुरी सन्यास आश्रम, नई दिल्ली',
        hero_label: 'ॐ • एक आध्यात्मिक यात्रा',

        // Home — About summary
        about_summary_label: 'आश्रम परिचय',
        about_summary_heading: 'भक्ति, सेवा और साधना का संगम',
        about_summary_body:
            'संध्या पुरी सन्यास आश्रम, नई दिल्ली के हृदय में स्थित एक पावन आध्यात्मिक केंद्र है। यहाँ साधक ध्यान, सत्संग और सेवा के माध्यम से अपने भीतर की शांति का अनुभव करते हैं। हमारी परम्परा सनातन धर्म के मूल्यों — करुणा, अहिंसा और लोक-कल्याण पर आधारित है।',

        // Home — Services
        services_label: 'हमारी सेवाएँ',
        services_heading: 'दैनिक एवं विशेष आराधनाएँ',
        service_satsang: 'सत्संग',
        service_satsang_desc: 'प्रतिदिन शास्त्र-चर्चा एवं भजन कीर्तन।',
        service_aarti: 'संध्या आरती',
        service_aarti_desc: 'सूर्यास्त के समय दीप-आरती और मंत्रोच्चार।',
        service_bhandara: 'भण्डारा',
        service_bhandara_desc: 'श्रद्धालुओं हेतु निःशुल्क सात्विक प्रसाद।',
        service_prasad: 'प्रसाद वितरण',
        service_prasad_desc: 'आरती के पश्चात पवित्र प्रसाद का वितरण।',
        service_guidance: 'आध्यात्मिक मार्गदर्शन',
        service_guidance_desc: 'अनुभवी सन्यासियों द्वारा निःशुल्क परामर्श।',

        // Donation CTA
        donate_cta_label: 'सेवा-कार्य',
        donate_cta_heading: 'आपका सहयोग, आश्रम की शक्ति',
        donate_cta_body:
            'आपके योगदान से आश्रम भण्डारा, गौ-सेवा एवं वंचितों के लिए शिक्षा सम्भव हो पाती है।',

        // Activities Section
        activities_label: 'पवित्र क्रियाकलाप',
        activities_heading: 'Sacred Activities at the Ashram',

        // About Page
        about_label: 'हम कौन हैं',
        about_heading: 'आश्रम का परिचय',
        about_intro:
            'संध्या पुरी सन्यास आश्रम एक प्राचीन परम्परा का प्रतीक है, जहाँ सन्यासी एवं गृहस्थ दोनों के लिए द्वार खुले हैं।',
        about_mission_label: 'हमारा संकल्प',
        about_mission:
            'हमारा संकल्प है — साधना, सेवा और सत्संग के माध्यम से समाज में आध्यात्मिक चेतना का प्रसार करना। हम मानते हैं कि शांति बाहरी नहीं, भीतर से उपजती है।',
        about_purpose_label: 'आध्यात्मिक उद्देश्य',
        about_purpose:
            'योग, ध्यान, मंत्रजाप एवं वेद-शास्त्रों का अध्ययन — साधक को आत्म-साक्षात्कार के पथ पर अग्रसर करता है।',
        about_community_label: 'सामुदायिक सेवा',
        about_community:
            'भोजन-दान, वस्त्र-दान, चिकित्सा शिविर एवं गौ-शाला — आश्रम की निरन्तर चलने वाली सेवाएँ हैं।',

        // History Page
        history_heading: 'आश्रम का इतिहास',
        history_p1:
            'संध्या पुरी सन्यास आश्रम की स्थापना एक ऐसे युग में हुई जब दिल्ली शहर अपने आध्यात्मिक मूल को पुनः खोज रहा था। आदरणीय संस्थापक श्री ने आई. पी. एस्टेट के समीप इस पावन भूमि का चयन किया, जहाँ गंगा-यमुना की सी पवित्र वायु आज भी प्रवाहित होती है।',
        history_p2:
            'संस्थापक का स्वप्न था — एक ऐसा स्थान जहाँ सन्यासी, गृहस्थ, बालक और वृद्ध सभी एक साथ बैठ कर सत्संग कर सकें। उन्होंने अपने जीवन के अनेक वर्ष तपस्या, ध्यान और सेवा में समर्पित किए। उनकी प्रेरणा से हजारों श्रद्धालुओं ने आध्यात्मिक मार्ग अपनाया।',
        history_p3:
            'दशकों की यात्रा में आश्रम ने भण्डारा-सेवा, गौ-सेवा, वस्त्र-दान, निःशुल्क शिक्षा एवं चिकित्सा शिविर के माध्यम से अनगिनत लोगों के जीवन को स्पर्श किया। प्रत्येक संध्या की आरती में आज भी वही दीप-शिखा जलती है, जो दशकों पूर्व प्रज्वलित की गई थी।',
        history_p4:
            'आज, संध्या पुरी सन्यास आश्रम केवल एक स्थान नहीं, बल्कि एक जीवन्त परम्परा है — जो प्रत्येक श्रद्धालु को शांति, करुणा और आत्म-बोध की ओर ले जाती है।',

        // Gallery / Contact / Donate
        gallery_label: 'दृश्यावली',
        gallery_heading: 'आश्रम के दृश्य',
        contact_label: 'सम्पर्क',
        contact_heading: 'हमसे जुड़िये',
        contact_address_label: 'पता',
        contact_hours: 'रात्रि 9 बजे तक खुला',
        contact_accessibility: 'व्हीलचेयर पहुँच उपलब्ध',
        donate_label: 'सेवा-योगदान',
        donate_heading: 'दान करें — आश्रम की सेवा में सहयोग दें',
        donate_left_sub: 'सुरक्षित ऑनलाइन भुगतान — Razorpay',
        donate_right_sub: 'UPI द्वारा त्वरित दान',
        scan_to_donate: 'किसी भी UPI ऐप से स्कैन करें',

        // Footer
        footer_tagline:
            'श्रद्धा, सेवा और साधना — आपकी आध्यात्मिक यात्रा का सहयोगी।',
        footer_rights: '© 2026 संध्या पुरी सन्यास आश्रम। सर्वाधिकार सुरक्षित।',
    },

    en: {
        hero_heading: 'A Sacred Sanctuary for Peace and Spiritual Awakening',
        hero_sub: 'Sandhya Puri Sanyas Ashram, New Delhi',
        hero_label: 'OM • A SPIRITUAL JOURNEY',

        about_summary_label: 'About the Ashram',
        about_summary_heading: 'Where Devotion, Service & Sadhana Meet',
        about_summary_body:
            'Sandhya Puri Sanyas Ashram, nestled in the heart of New Delhi, is a sacred spiritual centre. Here, seekers experience inner stillness through meditation, satsang and selfless service. Our tradition is rooted in the eternal values of Sanatan Dharma — compassion, non-violence and well-being for all.',

        services_label: 'Our Practices',
        services_heading: 'Daily & Special Offerings',
        service_satsang: 'Satsang',
        service_satsang_desc: 'Daily scriptural discourses and devotional singing.',
        service_aarti: 'Sandhya Aarti',
        service_aarti_desc: 'Evening lamp ritual with sacred mantras.',
        service_bhandara: 'Bhandara',
        service_bhandara_desc: 'Free sattvic community meals for devotees.',
        service_prasad: 'Prasad Distribution',
        service_prasad_desc: 'Sacred offerings shared after aarti.',
        service_guidance: 'Spiritual Guidance',
        service_guidance_desc: 'Personal counsel from experienced sanyasis.',

        donate_cta_label: 'Seva',
        donate_cta_heading: 'Your Support Sustains the Ashram',
        donate_cta_body:
            'Your contributions help us continue bhandara, cow-care and education for those in need.',

        activities_label: 'Sacred Practices',
        activities_heading: 'Sacred Activities at the Ashram',

        about_label: 'Who We Are',
        about_heading: 'Introducing the Ashram',
        about_intro:
            'Sandhya Puri Sanyas Ashram embodies an ancient tradition, welcoming both sanyasis and householders alike.',
        about_mission_label: 'Our Mission',
        about_mission:
            'To spread spiritual consciousness in society through sadhana, seva and satsang. We believe that peace does not arise from the outside — it blossoms from within.',
        about_purpose_label: 'Spiritual Purpose',
        about_purpose:
            'Through yoga, meditation, mantra-japa and the study of Vedic scriptures, the seeker progresses on the path of Self-realisation.',
        about_community_label: 'Community Service',
        about_community:
            'Food donation, clothing drives, medical camps and the goshala are part of the ashram’s continuous service to society.',

        history_heading: 'History of the Ashram',
        history_p1:
            'Sandhya Puri Sanyas Ashram was founded in an era when Delhi was rediscovering its spiritual roots. The revered founder chose this sacred land near IP Estate, where the pure air of the Ganga–Yamuna still flows today.',
        history_p2:
            'The founder’s dream was simple — a place where sanyasis, householders, children and elders could gather as one for satsang. He devoted decades of his life to tapasya, meditation and selfless service, inspiring thousands to embrace the spiritual path.',
        history_p3:
            'Over the decades, the ashram has touched countless lives through bhandara seva, goshala work, clothing drives, free education and medical camps. The same lamp that was lit decades ago still glows in every sandhya aarti.',
        history_p4:
            'Today, Sandhya Puri Sanyas Ashram is more than a place — it is a living tradition that gently leads every devotee toward peace, compassion and Self-knowledge.',

        gallery_label: 'Glimpses',
        gallery_heading: 'Glimpses of the Ashram',
        contact_label: 'Get in Touch',
        contact_heading: 'Connect with the Ashram',
        contact_address_label: 'Address',
        contact_hours: 'Open until 9 PM',
        contact_accessibility: 'Wheelchair accessible',

        donate_label: 'Seva Contribution',
        donate_heading: 'Donate — Support the Ashram',
        donate_left_sub: 'Secure Online Payment via Razorpay',
        donate_right_sub: 'Quick UPI Donation',
        scan_to_donate: 'Scan and donate using any UPI app',

        footer_tagline:
            'Devotion, service and sadhana — a companion on your spiritual journey.',
        footer_rights: '© 2026 Sandhya Puri Sanyas Ashram. All rights reserved.',
    },

    sa: {
        hero_heading: 'शान्तये आत्म-विकासाय च पवित्रं स्थानम्',
        hero_sub: 'सन्ध्या पुरी सन्न्यास आश्रमः, नवदिल्ली',
        hero_label: 'ॐ • आध्यात्मिकी यात्रा',

        about_summary_label: 'आश्रम-परिचयः',
        about_summary_heading: 'भक्ति-सेवा-साधनानां सङ्गमः',
        about_summary_body:
            'सन्ध्या पुरी सन्न्यास आश्रमः नवदिल्ल्याः हृदये स्थितः पवित्रं आध्यात्मिकं केन्द्रम्। अत्र साधकाः ध्यानेन सत्सङ्गेन सेवया च आन्तरिकं शान्तिं अनुभवन्ति। अस्माकं परम्परा सनातन-धर्मस्य मूल्येषु — करुणायां, अहिंसायां, लोक-कल्याणे च — प्रतिष्ठिता।',

        services_label: 'अस्माकं सेवाः',
        services_heading: 'दैनन्दिनानि विशिष्टानि च आराधनानि',
        service_satsang: 'सत्सङ्गः',
        service_satsang_desc: 'प्रतिदिनं शास्त्र-चर्चा भजनं च।',
        service_aarti: 'सन्ध्या-आरती',
        service_aarti_desc: 'सूर्यास्ते दीप-आरती मन्त्रोच्चारणं च।',
        service_bhandara: 'भण्डारा',
        service_bhandara_desc: 'श्रद्धालुभ्यः निःशुल्कं सात्त्विकं अन्नं।',
        service_prasad: 'प्रसाद-वितरणम्',
        service_prasad_desc: 'आर्त्या अनन्तरं पवित्रस्य प्रसादस्य वितरणम्।',
        service_guidance: 'आध्यात्मिकं मार्गदर्शनम्',
        service_guidance_desc: 'अनुभविभिः सन्न्यासिभिः निःशुल्कं परामर्शः।',

        donate_cta_label: 'सेवा-कर्म',
        donate_cta_heading: 'युष्माकं सहयोगः आश्रमस्य बलम्',
        donate_cta_body:
            'युष्माकं योगदानेन भण्डारा, गो-सेवा, वञ्चितेभ्यः शिक्षा च सम्भवति।',

        activities_label: 'पवित्राणि कर्माणि',
        activities_heading: 'Sacred Activities at the Ashram',

        about_label: 'वयं के स्मः',
        about_heading: 'आश्रम-परिचयः',
        about_intro:
            'सन्ध्या पुरी सन्न्यास आश्रमः प्राचीनायाः परम्परायाः प्रतीकः, यत्र सन्न्यासिनां गृहस्थानां च द्वारौ उद्घाटितौ।',
        about_mission_label: 'अस्माकं सङ्कल्पः',
        about_mission:
            'साधना-सेवा-सत्सङ्ग-माध्यमेन समाजे आध्यात्मिकीं चेतनां प्रसारयितुं अस्माकं सङ्कल्पः। शान्तिः बाह्या नास्ति — आन्तरिकेण उद्भवति।',
        about_purpose_label: 'आध्यात्मिकं प्रयोजनम्',
        about_purpose:
            'योगः, ध्यानम्, मन्त्र-जपः, वेद-शास्त्र-अध्ययनं च — साधकं आत्म-साक्षात्कारस्य पथे अग्रसारयति।',
        about_community_label: 'सामाजिकी सेवा',
        about_community:
            'अन्न-दानम्, वस्त्र-दानम्, चिकित्सा-शिविरम्, गो-शाला च — आश्रमस्य निरन्तरं चलन्ति सेवाः।',

        history_heading: 'आश्रमस्य इतिहासः',
        history_p1:
            'सन्ध्या पुरी सन्न्यास आश्रमस्य स्थापना तस्मिन् युगे जाता यदा दिल्ली-नगरं स्वकीयं आध्यात्मिकं मूलं पुनः अन्वेषयत्। आदरणीयः संस्थापकः आई.पी. एस्टेट-समीपे एनं पवित्रं भूमिं अचिनोत्।',
        history_p2:
            'संस्थापकस्य स्वप्नः आसीत् — एकं स्थानं यत्र सन्न्यासिनः, गृहस्थाः, बालकाः, वृद्धाः च एकत्र सत्सङ्गं कुर्युः। तेन तपस्यायां, ध्याने, सेवायां च अनेके वर्षाणि समर्पितानि।',
        history_p3:
            'दशकानां यात्रायां आश्रमः भण्डारया, गो-सेवया, वस्त्र-दानेन, निःशुल्कया शिक्षया, चिकित्सा-शिविरेण च असङ्ख्यान् जनान् स्पृष्टवान्।',
        history_p4:
            'अद्य, सन्ध्या पुरी सन्न्यास आश्रमः केवलं स्थानं न, अपितु जीवन्ती परम्परा अस्ति — या प्रत्येकं श्रद्धालुं शान्तेः, करुणायाः, आत्म-बोधस्य च मार्गे नयति।',

        gallery_label: 'दृश्यानि',
        gallery_heading: 'आश्रमस्य दृश्यानि',
        contact_label: 'सम्पर्कः',
        contact_heading: 'अस्मान् सह सम्पर्कं कुरुत',
        contact_address_label: 'पतम्',
        contact_hours: 'रात्रौ ९ वादनं यावत् उद्घाटितम्',
        contact_accessibility: 'चक्र-कुर्सी-प्रवेशः उपलब्धः',

        donate_label: 'सेवा-योगदानम्',
        donate_heading: 'दानं कुरु — आश्रमस्य सेवायां सहयोगं ददातु',
        donate_left_sub: 'सुरक्षितं ऑनलाइन-भुगतानम् — Razorpay',
        donate_right_sub: 'UPI द्वारा शीघ्रं दानम्',
        scan_to_donate: 'केनापि UPI-एप द्वारा स्कैन कुरुत',

        footer_tagline:
            'श्रद्धा, सेवा, साधना च — युष्माकं आध्यात्मिक्याः यात्रायाः सहचरः।',
        footer_rights: '© २०२६ सन्ध्या पुरी सन्न्यास आश्रमः। सर्वाणि अधिकाराणि सुरक्षितानि।',
    },
};

export default translations;
