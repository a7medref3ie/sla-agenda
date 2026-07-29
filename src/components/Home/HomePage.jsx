import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, LayoutDashboard, Scale, CalendarDays, Search,
  Bot, BarChart3, Calculator, ChevronLeft, ArrowLeft, ShieldCheck,
  Zap, Lock, Cpu, Sun, Moon, Gavel, CheckCircle2, ArrowRight
} from 'lucide-react';
import { getStats } from '../../utils/helpers';
import './HomePage.css';

export default function HomePage({ cases, sessions, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const stats = getStats(cases, sessions);

  const services = [
    {
      id: 'dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      title: 'لوحة المعلومات والإحصائيات',
      desc: 'متابعة شمولية ومباشرة لجلسات اليوم، التنبيهات الفورية ومؤشرات الإنجاز القضائي.',
      tag: 'لوحة القيادة 📊',
      badge: `${stats.activeCases} قضية قائمة`,
      colorClass: 'card-gold',
    },
    {
      id: 'cases',
      path: '/cases',
      icon: Scale,
      title: 'إدارة القضايا والملفات الرقمية',
      desc: 'إنشاء ملفات الدعاوى، حصر الأطراف، والتلخيص الآلي الفوري لـ الوقائع بالذكاء الاصطناعي.',
      tag: 'الأرشيف الرقمي ⚖️',
      badge: `${stats.totalCases} ملف قضائي`,
      colorClass: 'card-purple',
    },
    {
      id: 'calendar',
      path: '/calendar',
      icon: CalendarDays,
      title: 'تقويم ومواعيد الجلسات',
      desc: 'جدول زمني تفاعلي ملون لمتابعة الجلسات المقررة، القاعات، ودائرة الحكم.',
      tag: 'الأجندة الرقمية 📅',
      badge: `${stats.todaySessions} جلسة اليوم`,
      colorClass: 'card-blue',
    },
    {
      id: 'calculator',
      path: '/calculator',
      icon: Calculator,
      title: 'حاسبة الرسوم القضائية',
      desc: 'حساب دقيق للرسم النسبي ورسم صندوق الخدمات القضائية وتفصيل الخطوات.',
      tag: 'حساب مالي 💰',
      badge: 'دقة قانونية 100%',
      colorClass: 'card-gold',
    },
    {
      id: 'search',
      path: '/search',
      icon: Search,
      title: 'محرك البحث القضائي الذكي',
      desc: 'بحث متطور متعدد المعايير في رقم الدعوى، الوقائع، الأطراف، والموضوعات.',
      tag: 'بحث شجري 🔍',
      badge: 'نتائج لحظية',
      colorClass: 'card-emerald',
    },
    {
      id: 'assistant',
      path: '/assistant',
      icon: Bot,
      title: 'المساعد القضائي الذكي',
      desc: 'مستشار رقمي للمحادثة بالذكاء الاصطناعي يفهم الأسئلة ويستخرج الإحصائيات.',
      tag: 'ذكاء اصطناعي 🤖',
      badge: 'NLP عربي',
      colorClass: 'card-amber',
    },
    {
      id: 'reports',
      path: '/reports',
      icon: BarChart3,
      title: 'مركز التقارير الرسمية',
      desc: 'توليد وإخراج التقارير الإحصائية وتوزيع المحاكم مع الدعم الكامل للطباعة.',
      tag: 'التقارير 📈',
      badge: 'جاهز للطباعة 📄',
      colorClass: 'card-rose',
    },
  ];

  return (
    <div className="landing-page-wrapper">
      {/* 🌐 Landing Navbar (Dedicated & Independent) */}
      <header className="landing-navbar">
        <div className="landing-nav-brand">
          <div className="brand-logo-icon">
            <Sparkles size={24} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">أجندة قضايا الدولة</span>
            <span className="brand-sub">SLA Smart Agenda</span>
          </div>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-theme-toggle" onClick={onToggleTheme} title="تبديل المظهر">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/dashboard" className="landing-cta-btn">
            <span>دخول لوحة التحكم</span>
            <ChevronLeft size={16} />
          </Link>
        </div>
      </header>

      {/* 🚀 Full-Width Visual Hero Banner Section */}
      <section
        className="hero-full-banner"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero_full_width_bg.jpg)` }}
      >
        <div className="hero-banner-overlay">
          <div className="hero-banner-content">
            <div className="landing-hero-pill">
              <ShieldCheck size={14} className="text-gold" />
              <span>هيئة قضايا الدولة • برنامج سفراء الذكاء الاصطناعي 2026</span>
            </div>

            <h1 className="landing-hero-heading">
              أجندة تنظيم الجلسات والقضايا <br />
              <span className="gradient-highlight">والدعم القضائي الذكي</span>
            </h1>

            <p className="landing-hero-lead">
              منظومة رقمية لتنظيم المواعيد، أرشفة القضايا، والتلخيص التلقائي للوقائع لمساعدة المستشارين في إدارة أعمالهم بكفاءة.
            </p>

            <div className="landing-hero-buttons">
              <Link to="/dashboard" className="btn-landing primary">
                <LayoutDashboard size={18} />
                <span>دخول لوحة التحكم</span>
              </Link>

              <Link to="/cases" className="btn-landing secondary">
                <Scale size={18} />
                <span>إدارة القضايا</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🏛️ Interactive Service Cards Section */}
      <section className="landing-services-section">
        <div className="services-header text-center">
          <h2 className="services-main-title">
            خدمات المنظومة الرقمية
          </h2>
          <p className="services-sub-title">
            انقر على أي تطبيق للوصول الفوري للخدمة القضائية المطلوبة
          </p>
        </div>

        <div className="landing-services-grid">
          {services.map(s => (
            <div key={s.id} className={`landing-service-card ${s.colorClass}`} onClick={() => navigate(s.path)}>
              <div className="service-card-header">
                <div className="icon-container">
                  <s.icon size={26} />
                </div>
                <span className="service-tag">{s.tag}</span>
              </div>

              <h3 className="service-card-title">{s.title}</h3>
              <p className="service-card-desc">{s.desc}</p>

              <div className="service-card-action">
                <span className="badge-metric">{s.badge}</span>
                <span className="action-link">
                  <span>دخول</span>
                  <ChevronLeft size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🖼️ Showcase Visual Section */}
      <section className="landing-showcase-section">
        <div className="glass-card showcase-inner-card">
          <div className="showcase-visual-col">
            <img
              src={`${import.meta.env.BASE_URL}images/court_digital_agenda.png`}
              alt="الأجندة القضائية"
              className="showcase-img"
            />
          </div>
          <div className="showcase-text-col">
            <div className="showcase-pill">
              <Zap size={14} className="text-gold" />
              <span>عدالة ناجزة وتوفير للوقت</span>
            </div>
            <h2>مصمم خصيصاً لمستشاري هيئة قضايا الدولة</h2>
            <p>
              يقتصر دور التطبيق على دعم البحث والتنظيم والتلخيص وتحسين كفاءة العمل الإداري والقضائي، دون التدخل في إصدار الأحكام القضائية.
            </p>

            <div className="showcase-mini-grid">
              <div className="mini-box">
                <Lock size={20} className="text-gold mb-2" />
                <h4>سرية تامة</h4>
                <p>تخزين محلي بالمتصفح 100%</p>
              </div>
              <div className="mini-box">
                <Cpu size={20} className="text-purple mb-2" />
                <h4>معالجة آلية</h4>
                <p>تنظيم أوتوماتيكي للجلسات</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ Landing Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Sparkles size={20} className="text-gold" />
            <span>هيئة قضايا الدولة • أجندة المستشار الذكية © 2026</span>
          </div>
          <p className="text-xs text-muted">
            مشروع تخرج من دورة سفراء الذكاء الاصطناعي والتحول الرقمي
          </p>
        </div>
      </footer>
    </div>
  );
}
