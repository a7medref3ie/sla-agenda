// ========================================
// محرك الذكاء الاصطناعي المحلي
// AI Engine - Rule-based AI Simulation
// ========================================

import { CASE_TYPES, CASE_STATUSES } from '../data/sampleData';
import { formatDate, formatTime, isToday, isTomorrow, isThisWeek } from './helpers';

// ── Case Summarization ──
export function generateCaseSummary(caseData) {
  const typeLabel = CASE_TYPES[caseData.type]?.label || caseData.type;
  const statusLabel = CASE_STATUSES[caseData.status]?.label || caseData.status;

  // Extract key information
  const summary = [];
  summary.push(`📋 ملخص ذكي للقضية رقم ${caseData.number} لسنة ${caseData.year}`);
  summary.push('─'.repeat(40));
  summary.push(`📌 النوع: ${typeLabel}`);
  summary.push(`📍 المحكمة: ${caseData.court} - ${caseData.circuit}`);
  summary.push(`⚖️ الحالة: ${statusLabel}`);
  summary.push('');
  summary.push(`👤 المدعي: ${caseData.plaintiff}`);
  summary.push(`👥 المدعى عليه: ${caseData.defendant}`);
  summary.push('');
  summary.push(`📝 الموضوع: ${caseData.subject}`);
  summary.push('');

  // AI-generated analysis
  summary.push('🤖 تحليل ذكي:');
  summary.push('─'.repeat(20));

  // Type-specific analysis
  if (caseData.type === 'administrative') {
    summary.push('• القضية من اختصاص القضاء الإداري (مجلس الدولة)');
    summary.push('• يُنصح بالتأكد من استنفاد طرق التظلم الإداري قبل اللجوء للقضاء');
    if (caseData.subject.includes('طعن')) {
      summary.push('• يجب مراعاة مواعيد الطعن المقررة قانوناً (60 يوماً من تاريخ العلم)');
    }
  } else if (caseData.type === 'civil') {
    summary.push('• القضية مدنية تخضع لأحكام قانون المرافعات');
    if (caseData.facts.includes('مطالبة') || caseData.facts.includes('مبلغ')) {
      summary.push('• يُنصح بتقديم مستندات تثبت الحق في المبالغ المطالب بها');
    }
  } else if (caseData.type === 'criminal') {
    summary.push('• القضية جنائية - يجب مراعاة ضمانات المتهم المكفولة دستورياً');
    summary.push('• التقيد بالمواعيد الإجرائية المنصوص عليها في قانون الإجراءات الجنائية');
  } else if (caseData.type === 'commercial') {
    summary.push('• القضية تجارية تخضع لاختصاص المحاكم الاقتصادية');
    summary.push('• يُنصح بمراجعة الشروط التعاقدية والبنود المالية');
  } else if (caseData.type === 'labor') {
    summary.push('• القضية عمالية تخضع لأحكام قانون العمل');
    summary.push('• يُراعى أن القضايا العمالية معفاة من الرسوم القضائية');
  } else if (caseData.type === 'family') {
    summary.push('• القضية من قضايا الأحوال الشخصية');
    summary.push('• تخضع لأحكام قانون الأحوال الشخصية المصري');
  }

  // Priority-based recommendation
  summary.push('');
  if (caseData.priority === 'high') {
    summary.push('⚠️ الأولوية: عالية - يتطلب متابعة فورية ومستمرة');
  } else if (caseData.priority === 'medium') {
    summary.push('📊 الأولوية: متوسطة - متابعة دورية');
  } else {
    summary.push('📋 الأولوية: عادية');
  }

  // Status-based recommendation
  if (caseData.status === 'reserved') {
    summary.push('');
    summary.push('🔔 تنبيه: القضية محجوزة للحكم - يُرجى متابعة موعد النطق بالحكم');
  } else if (caseData.status === 'postponed') {
    summary.push('');
    summary.push('🔔 تنبيه: القضية مؤجلة - يُرجى متابعة الموعد الجديد');
  }

  return summary.join('\n');
}

// ── AI Assistant Chatbot ──
export function processAIQuery(query, cases, sessions) {
  const lowerQuery = query.toLowerCase().trim();

  // Simulate typing delay
  const response = {
    text: '',
    type: 'info',
    timestamp: new Date().toISOString(),
  };

  // ── Greetings ──
  if (matchesIntent(lowerQuery, ['مرحبا', 'اهلا', 'سلام', 'صباح', 'مساء', 'هاي', 'هلو'])) {
    response.text = 'أهلاً بك! أنا المساعد الذكي لأجندة قضايا الدولة. يمكنني مساعدتك في:\n\n'
      + '📅 الاستعلام عن جلسات اليوم والأيام القادمة\n'
      + '📋 تلخيص القضايا ومعرفة تفاصيلها\n'
      + '📊 عرض إحصائيات القضايا\n'
      + '🔍 البحث عن قضية بالرقم أو الموضوع\n'
      + '💡 تقديم توصيات لتنظيم جدولك\n\n'
      + 'كيف يمكنني مساعدتك؟';
    response.type = 'greeting';
    return response;
  }

  // ── Today's sessions ──
  if (matchesIntent(lowerQuery, ['جلسات اليوم', 'جلسه اليوم', 'اليوم', 'جلساتي اليوم', 'ما جلسات', 'عندي جلسات'])) {
    const todaySessions = sessions.filter(s => isToday(s.date) && s.status === 'scheduled');
    if (todaySessions.length === 0) {
      response.text = '✅ لا توجد جلسات مقررة اليوم. يمكنك الاستفادة من الوقت في إعداد المذكرات.';
    } else {
      response.text = `📅 لديك ${todaySessions.length} جلسة اليوم:\n\n`;
      todaySessions.forEach((s, i) => {
        const caseData = cases.find(c => c.id === s.caseId);
        response.text += `${i + 1}. ⏰ ${formatTime(s.date)} - ${s.court}\n`;
        response.text += `   📋 قضية رقم ${caseData?.number || '—'} (${s.type})\n`;
        response.text += `   📍 ${s.hall}\n\n`;
      });
    }
    response.type = 'sessions';
    return response;
  }

  // ── Tomorrow's sessions ──
  if (matchesIntent(lowerQuery, ['جلسات غدا', 'جلسات بكره', 'غدا', 'بكرة', 'بكره'])) {
    const tomorrowSessions = sessions.filter(s => isTomorrow(s.date) && s.status === 'scheduled');
    if (tomorrowSessions.length === 0) {
      response.text = '✅ لا توجد جلسات مقررة غداً.';
    } else {
      response.text = `📅 لديك ${tomorrowSessions.length} جلسة غداً:\n\n`;
      tomorrowSessions.forEach((s, i) => {
        const caseData = cases.find(c => c.id === s.caseId);
        response.text += `${i + 1}. ⏰ ${formatTime(s.date)} - ${s.court}\n`;
        response.text += `   📋 قضية رقم ${caseData?.number || '—'} (${s.type})\n\n`;
      });
    }
    response.type = 'sessions';
    return response;
  }

  // ── This week's sessions ──
  if (matchesIntent(lowerQuery, ['جلسات الاسبوع', 'هذا الاسبوع', 'الأسبوع', 'اسبوع'])) {
    const weekSessions = sessions.filter(s => isThisWeek(s.date) && s.status === 'scheduled');
    if (weekSessions.length === 0) {
      response.text = '✅ لا توجد جلسات مقررة هذا الأسبوع.';
    } else {
      response.text = `📅 لديك ${weekSessions.length} جلسة هذا الأسبوع:\n\n`;
      weekSessions.forEach((s, i) => {
        const caseData = cases.find(c => c.id === s.caseId);
        response.text += `${i + 1}. 📆 ${formatDate(s.date)} - ⏰ ${formatTime(s.date)}\n`;
        response.text += `   ${s.court} - ${s.hall}\n`;
        response.text += `   قضية رقم ${caseData?.number || '—'}\n\n`;
      });
    }
    response.type = 'sessions';
    return response;
  }

  // ── Statistics ──
  if (matchesIntent(lowerQuery, ['احصائيات', 'إحصائيات', 'إحصاء', 'ارقام', 'أرقام', 'كم قضية', 'كم عدد', 'عدد القضايا'])) {
    const activeCases = cases.filter(c => c.status !== 'closed').length;
    const byType = {};
    cases.forEach(c => {
      const typeLabel = CASE_TYPES[c.type]?.label || c.type;
      byType[typeLabel] = (byType[typeLabel] || 0) + 1;
    });

    response.text = `📊 إحصائيات القضايا:\n\n`;
    response.text += `• إجمالي القضايا: ${cases.length}\n`;
    response.text += `• القضايا النشطة: ${activeCases}\n`;
    response.text += `• القضايا المؤجلة: ${cases.filter(c => c.status === 'postponed').length}\n`;
    response.text += `• المحجوزة للحكم: ${cases.filter(c => c.status === 'reserved').length}\n`;
    response.text += `• المنتهية: ${cases.filter(c => c.status === 'closed').length}\n\n`;
    response.text += `📂 توزيع حسب النوع:\n`;
    Object.entries(byType).forEach(([type, count]) => {
      response.text += `  • ${type}: ${count}\n`;
    });
    response.type = 'stats';
    return response;
  }

  // ── Case search by number ──
  const numberMatch = lowerQuery.match(/قضية?\s*(?:رقم)?\s*(\d+)/);
  if (numberMatch) {
    const caseNum = numberMatch[1];
    const foundCase = cases.find(c => c.number === caseNum);
    if (foundCase) {
      response.text = generateCaseSummary(foundCase);
    } else {
      response.text = `❌ لم أجد قضية بالرقم ${caseNum}. تأكد من رقم القضية وأعد المحاولة.`;
    }
    response.type = 'case';
    return response;
  }

  // ── Recommendations ──
  if (matchesIntent(lowerQuery, ['توصيات', 'نصائح', 'اقتراحات', 'نظم جدولي', 'تنظيم', 'ساعدني'])) {
    const highPriority = cases.filter(c => c.priority === 'high' && c.status !== 'closed');
    const postponed = cases.filter(c => c.status === 'postponed');
    const reserved = cases.filter(c => c.status === 'reserved');

    response.text = `💡 توصيات ذكية لتنظيم عملك:\n\n`;

    if (highPriority.length > 0) {
      response.text += `🔴 قضايا عالية الأولوية (${highPriority.length}):\n`;
      highPriority.forEach(c => {
        response.text += `  • قضية ${c.number}/${c.year} - ${c.subject}\n`;
      });
      response.text += '\n';
    }

    if (reserved.length > 0) {
      response.text += `⚡ قضايا محجوزة للحكم (${reserved.length}) - تابع مواعيد النطق:\n`;
      reserved.forEach(c => {
        response.text += `  • قضية ${c.number}/${c.year}\n`;
      });
      response.text += '\n';
    }

    if (postponed.length > 0) {
      response.text += `⏳ قضايا مؤجلة (${postponed.length}) - راجع أسباب التأجيل:\n`;
      postponed.forEach(c => {
        response.text += `  • قضية ${c.number}/${c.year}\n`;
      });
      response.text += '\n';
    }

    response.text += '📌 نصائح عامة:\n';
    response.text += '  • قم بإعداد مذكرات الدفاع قبل الجلسة بيومين على الأقل\n';
    response.text += '  • تابع مواعيد الطعن والمهل القانونية بانتظام\n';
    response.text += '  • احرص على توثيق قرارات كل جلسة فور انتهائها\n';
    response.type = 'recommendation';
    return response;
  }

  // ── Help ──
  if (matchesIntent(lowerQuery, ['مساعدة', 'مساعده', 'كيف', 'ماذا تفعل', 'ايش تسوي', 'قدراتك'])) {
    response.text = '🤖 يمكنني مساعدتك في:\n\n'
      + '1️⃣ **جلسات اليوم** - اكتب "جلسات اليوم"\n'
      + '2️⃣ **جلسات غداً** - اكتب "جلسات غداً"\n'
      + '3️⃣ **جلسات الأسبوع** - اكتب "جلسات الأسبوع"\n'
      + '4️⃣ **إحصائيات** - اكتب "إحصائيات"\n'
      + '5️⃣ **بحث عن قضية** - اكتب "قضية رقم 1245"\n'
      + '6️⃣ **توصيات** - اكتب "توصيات"\n';
    response.type = 'help';
    return response;
  }

  // ── Default / Fallback ──
  response.text = 'عذراً، لم أفهم استفسارك بشكل واضح. يمكنك تجربة:\n\n'
    + '• "جلسات اليوم" - لعرض جلسات اليوم\n'
    + '• "إحصائيات" - لعرض إحصائيات القضايا\n'
    + '• "قضية رقم 1245" - للبحث عن قضية\n'
    + '• "توصيات" - للحصول على توصيات ذكية\n'
    + '• "مساعدة" - لعرض كل الأوامر';
  response.type = 'fallback';
  return response;
}

// ── Smart Alerts ──
export function getSmartAlerts(cases, sessions) {
  const alerts = [];
  const now = new Date();

  // Today's sessions
  const todaySessions = sessions.filter(s => isToday(s.date) && s.status === 'scheduled');
  if (todaySessions.length > 0) {
    alerts.push({
      id: 'alert-today',
      type: 'warning',
      icon: 'Clock',
      title: `لديك ${todaySessions.length} جلسة اليوم`,
      message: todaySessions.map(s => `${formatTime(s.date)} - ${s.court}`).join(' | '),
      priority: 1,
    });
  }

  // Tomorrow's sessions
  const tomorrowSessions = sessions.filter(s => isTomorrow(s.date) && s.status === 'scheduled');
  if (tomorrowSessions.length > 0) {
    alerts.push({
      id: 'alert-tomorrow',
      type: 'info',
      icon: 'CalendarClock',
      title: `${tomorrowSessions.length} جلسة غداً`,
      message: 'تأكد من إعداد المستندات والمذكرات المطلوبة',
      priority: 2,
    });
  }

  // Reserved cases (awaiting judgment)
  const reservedCases = cases.filter(c => c.status === 'reserved');
  if (reservedCases.length > 0) {
    alerts.push({
      id: 'alert-reserved',
      type: 'info',
      icon: 'Gavel',
      title: `${reservedCases.length} قضية محجوزة للحكم`,
      message: 'تابع مواعيد النطق بالأحكام',
      priority: 3,
    });
  }

  // High priority cases
  const highPriority = cases.filter(c => c.priority === 'high' && c.status !== 'closed');
  if (highPriority.length > 0) {
    alerts.push({
      id: 'alert-priority',
      type: 'danger',
      icon: 'AlertTriangle',
      title: `${highPriority.length} قضية عالية الأولوية`,
      message: 'تتطلب متابعة ومراجعة فورية',
      priority: 4,
    });
  }

  // Cases postponed for a long time
  const longPostponed = cases.filter(c => {
    if (c.status !== 'postponed') return false;
    const updated = new Date(c.updatedAt);
    const daysSince = Math.floor((now - updated) / 86400000);
    return daysSince > 14;
  });
  if (longPostponed.length > 0) {
    alerts.push({
      id: 'alert-postponed',
      type: 'warning',
      icon: 'Clock',
      title: `${longPostponed.length} قضية مؤجلة منذ فترة طويلة`,
      message: 'يُنصح بمراجعة أسباب التأجيل وتحديد موعد جديد',
      priority: 5,
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority);
}

// ── Auto-classify case type ──
export function suggestCaseType(description) {
  const lower = description.toLowerCase();
  if (matchesAny(lower, ['إداري', 'طعن', 'قرار', 'وزارة', 'هيئة', 'ترقية', 'نقل', 'تعيين', 'جامعة'])) return 'administrative';
  if (matchesAny(lower, ['جنائي', 'تزوير', 'اختلاس', 'سرقة', 'نيابة', 'متهم', 'جناية', 'جنحة'])) return 'criminal';
  if (matchesAny(lower, ['تجاري', 'بنك', 'شركة', 'قرض', 'علامة تجارية', 'إفلاس', 'ائتمان'])) return 'commercial';
  if (matchesAny(lower, ['عمالي', 'عامل', 'فصل', 'أجر', 'عمل', 'مكافأة', 'إجازة', 'نقابة عمال'])) return 'labor';
  if (matchesAny(lower, ['أحوال', 'نفقة', 'طلاق', 'حضانة', 'زواج', 'ميراث', 'وصية'])) return 'family';
  return 'civil';
}

// ── Helper Functions ──
function matchesIntent(query, keywords) {
  return keywords.some(keyword => query.includes(keyword));
}

function matchesAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}
