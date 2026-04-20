import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            queue: 'Verification Queue',
            grievances: 'Grievances',
            bulletin: 'Bulletin Board',
            profile: 'Profile',
            logout: 'Logout',
            faq: 'Support / FAQ'
        },
        common: {
            loading: 'Loading...',
            search: 'Search',
            download: 'Download Report',
            submit: 'Submit',
            cancel: 'Cancel',
            save: 'Save Changes',
            worker_id: 'Worker ID',
            platform: 'Platform',
            status: 'Status',
            date: 'Date',
            amount: 'Amount',
            action: 'Action',
            note: 'Note',
            back: 'Back'
        },
        worker: {
            welcome: 'Welcome back',
            subtitle: 'Your personal digital labor identity and earnings vault.',
            log_shift: 'Log New Shift',
            stats_net: 'Total Net Earnings',
            stats_hours: 'Hours Worked',
            stats_verified: 'Verified Records',
            chart_earnings: 'Earnings Trajectory',
            chart_dist: 'Platform Distribution',
            history_title: 'Earnings History'
        },
        verifier: {
            title: 'Verifier Overview',
            subtitle: 'Monitoring digital labor integrity and trust protocols.',
            queue_btn: 'Open Verification Queue',
            stats_pending: 'Pending Review',
            stats_verified: 'Total Verified',
            stats_flagged: 'Flagged Issues',
            chart_integrity: 'System-wide Verification Integrity',
            chart_dist: 'Status Distribution',
            history_title: 'Your Personal Audit History',
            audit_queue: 'Audit Queue',
            inspect_title: 'Inspection',
            ai_assist: 'AI Anomaly Assist',
            evidence: 'Digital Evidence',
            audit_comp: 'Audit Comparison',
            worker_reported: 'Worker Reported',
            verifier_obs: 'Verifier Observed',
            matches: 'Matches',
            verify_btn: 'Verify',
            flag_btn: 'Flag (Dispute)',
            unverifiable: 'Unverifiable'
        },
        advocate: {
            title: 'Advocate Oversight Panel',
            subtitle: 'Systemic analysis, commission monitoring, and support.',
            stats_vulnerability: 'Vulnerability Flags',
            stats_extraction: 'Systemic Extraction',
            chart_commission: 'Commission Trends (%)',
            chart_zones: 'Income Distribution',
            research_hub: 'Individual Worker Research Hub',
            search_placeholder: 'Enter Worker Email to inspect history...',
            inspect_btn: 'Inspect Worker'
        },
        admin: {
            title: 'Super Admin Command Center',
            subtitle: 'Full system oversight, user management, and tracking.',
            stats_volume: 'Global Net Volume',
            stats_shifts: 'Total Shifts Logged',
            stats_users: 'System Users',
            stats_trust: 'Trust Verifiers',
            chart_perf: 'Global Platform Performance',
            chart_dist: 'User Role Distribution',
            directory: 'System User Directory',
            onboard: 'Provisional User Onboarding'
        },
        auth: {
            login_title: 'Welcome Back',
            login_sub: 'Access your FairGig ecosystem',
            register_title: 'Join FairGig',
            register_sub: 'Empowering gig workers with data integrity',
            email: 'Email Address',
            password: 'Password',
            role: 'Your Role',
            login_btn: 'Login',
            register_btn: 'Register',
            no_acc: "Don't have an account?",
            has_acc: 'Already have an account?'
        },
        log: {
            title: 'Log New Shift',
            subtitle: 'Input your platform data for verification.',
            gross: 'Gross Earned (Rs.)',
            net: 'Net Received (Rs.)',
            deductions: 'Platform Fees / Deductions',
            hours: 'Hours Worked',
            screenshot: 'Upload Platform Screenshot (AI Verification)',
            success: 'Shift logged successfully!'
        },
        grievance: {
            title: 'Grievance Resolution Board',
            subtitle: 'Report unfair behavior or technical errors.',
            category: 'Issue Category',
            desc: 'Description of the Issue',
            report_btn: 'Report New Issue',
            my_issues: 'My Reported Issues'
        },
        bulletin: {
            title: 'Community Bulletin Board',
            subtitle: 'Anonymous space for workers to share experiences.',
            post_placeholder: "What's on your mind? (Post anonymously)",
            post_btn: 'Post to Board',
            delete_btn: 'Delete Post'
        },
        profile: {
            title: 'Worker Profile',
            subtitle: 'Manage your digital identity.',
            security: 'Security Settings',
            update_btn: 'Update Profile'
        },
        support: {
            title: 'Worker Support & Help Center',
            subtitle: 'Everything you need to know about FairGig.',
            still_help: 'Still need help?',
            contact_adv: 'Contact an Advocate'
        }
    },
    ur: {
        nav: {
            dashboard: 'ڈیش بورڈ',
            queue: 'تصدیقی فہرست',
            grievances: 'شکایات',
            bulletin: 'کمیونٹی بورڈ',
            profile: 'پروفائل',
            logout: 'لاگ آؤٹ',
            faq: 'مدد / سوالات'
        },
        common: {
            loading: 'لوڈنگ...',
            search: 'تلاش کریں',
            download: 'رپورٹ ڈاؤن لوڈ کریں',
            submit: 'جمع کرائیں',
            cancel: 'منسوخ کریں',
            save: 'تبدیلیاں محفوظ کریں',
            worker_id: 'ورکر آئی ڈی',
            platform: 'پلیٹ فارم',
            status: 'حیثیت',
            date: 'تاریخ',
            amount: 'رقم',
            action: 'کارروائی',
            note: 'نوٹ',
            back: 'واپس'
        },
        worker: {
            welcome: 'خوش آمدید',
            subtitle: 'آپ کی ڈیجیٹل لیبر شناخت اور آمدنی کا خزانہ۔',
            log_shift: 'نئی شفٹ درج کریں',
            stats_net: 'کل خالص آمدنی',
            stats_hours: 'کام کے گھنٹے',
            stats_verified: 'تصدیق شدہ ریکارڈز',
            chart_earnings: 'آمدنی کا گراف',
            chart_dist: 'پلیٹ فارم کی تقسیم',
            history_title: 'آمدنی کی تاریخ'
        },
        verifier: {
            title: 'تصدیقی جائزہ',
            subtitle: 'ڈیجیٹل لیبر کی سالمیت اور اعتماد کی نگرانی۔',
            queue_btn: 'تصدیقی فہرست کھولیں',
            stats_pending: 'زیر التواء جائزے',
            stats_verified: 'کل تصدیق شدہ',
            stats_flagged: 'نشاندہی شدہ مسائل',
            chart_integrity: 'نظام کی تصدیقی سالمیت',
            chart_dist: 'حیثیت کی تقسیم',
            history_title: 'آپ کی آڈٹ کی تاریخ',
            audit_queue: 'آڈٹ کی قطار',
            inspect_title: 'معائنہ',
            ai_assist: 'AI اینوملی اسسٹ',
            evidence: 'ڈیجیٹل ثبوت',
            audit_comp: 'آڈٹ کا موازنہ',
            worker_reported: 'ورکر کی رپورٹ',
            verifier_obs: 'تصدیق کنندہ کا مشاہدہ',
            matches: 'مطابقت رکھتا ہے',
            verify_btn: 'تصدیق کریں',
            flag_btn: 'نشان زد کریں (تنازعہ)',
            unverifiable: 'ناقابل تصدیق'
        },
        advocate: {
            title: 'ایڈووکیٹ اوورسائٹ پینل',
            subtitle: 'نظامی تجزیہ، کمیشن کی نگرانی، اور تعاون۔',
            stats_vulnerability: 'خطرے کی نشانیاں',
            stats_extraction: 'نظامی کٹوتی',
            chart_commission: 'کمیشن کے رجحانات (%)',
            chart_zones: 'آمدنی کی تقسیم',
            research_hub: 'انفرادی ورکر ریسرچ ہب',
            search_placeholder: 'ورکر کی ای میل درج کریں...',
            inspect_btn: 'معائنہ کریں'
        },
        admin: {
            title: 'سپر ایڈمن کمانڈ سینٹر',
            subtitle: 'نظام کی مکمل نگرانی اور انتظام۔',
            stats_volume: 'عالمی خالص حجم',
            stats_shifts: 'کل درج شدہ شفٹیں',
            stats_users: 'سسٹم صارفین',
            stats_trust: 'ٹرسٹ ویریفائرز',
            chart_perf: 'عالمی پلیٹ فارم کارکردگی',
            chart_dist: 'صارف کے کردار کی تقسیم',
            directory: 'صارفین کی فہرست',
            onboard: 'نئے صارفین کی شمولیت'
        },
        auth: {
            login_title: 'خوش آمدید',
            login_sub: 'اپنے فیئر گگ سسٹم میں لاگ ان کریں',
            register_title: 'فیئر گگ میں شامل ہوں',
            register_sub: 'ڈیٹا کی شفافیت کے ساتھ ورکرز کو باائتیار بنانا',
            email: 'ای میل ایڈریس',
            password: 'پاس ورڈ',
            role: 'آپ کا کردار',
            login_btn: 'لاگ ان کریں',
            register_btn: 'رجسٹر کریں',
            no_acc: "اکاؤنٹ نہیں ہے؟",
            has_acc: 'پہلے سے اکاؤنٹ ہے؟'
        },
        log: {
            title: 'نئی شفٹ درج کریں',
            subtitle: 'تصدیق کے لیے اپنا ڈیٹا فراہم کریں۔',
            gross: 'کل آمدنی (روپے)',
            net: 'خالص آمدنی (روپے)',
            deductions: 'پلیٹ فارم فیس / کٹوتی',
            hours: 'کام کے گھنٹے',
            screenshot: 'اسکرین شاٹ اپ لوڈ کریں (AI تصدیق)',
            success: 'شفٹ کامیابی سے درج ہو گئی!'
        },
        grievance: {
            title: 'شکایات کا بورڈ',
            subtitle: 'ناانصافی یا تکنیکی خرابیوں کی اطلاع دیں۔',
            category: 'مسئلے کی قسم',
            desc: 'مسئلے کی تفصیل',
            report_btn: 'نیا مسئلہ رپورٹ کریں',
            my_issues: 'میری رپورٹ کردہ شکایات'
        },
        bulletin: {
            title: 'کمیونٹی بلیٹن بورڈ',
            subtitle: 'ورکرز کے لیے تجربات شیئر کرنے کی جگہ۔',
            post_placeholder: "آپ کیا سوچ رہے ہیں؟ (گمنام پوسٹ کریں)",
            post_btn: 'بورڈ پر پوسٹ کریں',
            delete_btn: 'پوسٹ حذف کریں'
        },
        profile: {
            title: 'ورکر پروفائل',
            subtitle: 'اپنی ڈیجیٹل شناخت کا انتظام کریں۔',
            security: 'سیکیورٹی سیٹنگز',
            update_btn: 'پروفائل اپ ڈیٹ کریں'
        },
        support: {
            title: 'سپورٹ اور ہیلپ سینٹر',
            subtitle: 'فیئر گگ کے بارے میں سب کچھ جانیں۔',
            still_help: 'مزید مدد کی ضرورت ہے؟',
            contact_adv: 'ایڈووکیٹ سے رابطہ کریں'
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('fairgig_lang') || 'en');

    useEffect(() => {
        localStorage.setItem('fairgig_lang', lang);
        document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
