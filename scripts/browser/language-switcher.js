(() => {
  "use strict";

  const LANGUAGES = ["en", "ro", "ar"];
  const STORAGE_KEY = "nooruldeen-language";
  const translations = Object.create(null);

  function add(en, ro, ar) {
    translations[normalize(en)] = { ro, ar };
  }

  function normalize(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
  }

  const entries = [
    ["Skip to content","Sari la conținut","انتقل إلى المحتوى"],
    ["CONTACT","CONTACT","اتصل بي"],
    ["HOME","ACASĂ","الرئيسية"],
    ["ABOUT","DESPRE","نبذة"],
    ["WORK","LUCRĂRI","الأعمال"],
    ["HOBBIES","PASIUNI","الهوايات"],
    ["PIANO","PIAN","البيانو"],
    ["PHOTOGRAPHY","FOTOGRAFIE","التصوير"],
    ["BACK TO TOP ↑","ÎNAPOI SUS ↑","العودة إلى الأعلى ↑"],
    ["BACK TO WORK ↑","ÎNAPOI LA LUCRĂRI ↑","العودة إلى الأعمال ↑"],
    ["BACK TO DESIGN ↑","ÎNAPOI LA DESIGN ↑","العودة إلى التصميم ↑"],
    ["BACK TO SITE ↑","ÎNAPOI LA SITE ↑","العودة إلى الموقع ↑"],
    ["BACK TO NOOR’S SITE","ÎNAPOI LA SITE-UL LUI NOOR","العودة إلى موقع نور"],
    ["BACK TO SELECTED WORK ↙","ÎNAPOI LA PROIECTELE SELECTATE ↙","العودة إلى الأعمال المختارة ↙"],
    ["BACK TO SELECTED DESIGN WORK","ÎNAPOI LA PROIECTELE DE DESIGN","العودة إلى أعمال التصميم المختارة"],
    ["CONTACT NOOR","CONTACTEAZĂ-L PE NOOR","تواصل مع نور"],
    ["Skip to content","Sari la conținut","انتقل إلى المحتوى"],
    ["EXPLORE DESIGN","EXPLOREAZĂ DESIGNUL","استكشف التصميم"],
    ["EXPLORE DESIGN WORK ↗","EXPLOREAZĂ LUCRĂRILE DE DESIGN ↗","استكشف أعمال التصميم ↗"],
    ["EXPLORE RESEARCH ↗","EXPLOREAZĂ CERCETAREA ↗","استكشف الأبحاث ↗"],
    ["EXPLORE MORE ↗","DESCOPERĂ MAI MULT ↗","اكتشف المزيد ↗"],
    ["LISTEN TO MORE ↗","ASCULTĂ MAI MULT ↗","استمع إلى المزيد ↗"],
    ["CONTACT NOOR ↗","CONTACTEAZĂ-L PE NOOR ↗","تواصل مع نور ↗"],
    ["CONTACT ↗","CONTACT ↗","اتصل بي ↗"],
    ["SCROLL","DERULEAZĂ","مرر"],
    ["TO EXPLORE","PENTRU A EXPLORA","للاستكشاف"],
    ["SCROLL TO EXPLORE ↓","DERULEAZĂ PENTRU A EXPLORA ↓","مرر للاستكشاف ↓"],
    ["OFF THE CLOCK","ÎN AFARA MUNCII","خارج أوقات العمل"],
    ["DESIGN / CODE / RESEARCH","DESIGN / COD / CERCETARE","تصميم / برمجة / أبحاث"],
    ["DESIGN / DEVELOPMENT","DESIGN / DEZVOLTARE","تصميم / تطوير"],
    ["WEB · APP · MOTION","WEB · APLICAȚII · ANIMAȚIE","ويب · تطبيقات · حركة"],
    ["WEB · IDENTITY · MOTION","WEB · IDENTITATE · ANIMAȚIE","ويب · هوية · حركة"],
    ["WEBSITES","SITE-URI WEB","مواقع إلكترونية"],
    ["APP + SOFTWARE","APLICAȚII + SOFTWARE","تطبيقات + برمجيات"],
    ["WEB DEVELOPMENT","DEZVOLTARE WEB","تطوير الويب"],
    ["LOGOS + IDENTITY","LOGOURI + IDENTITATE","شعارات + هوية"],
    ["ANIMATION + MOTION","ANIMAȚIE + MIȘCARE","رسوم متحركة + حركة"],
    ["VIBE CODING","VIBE CODING","برمجة إبداعية"],
    ["STATISTICAL RESEARCH","CERCETARE STATISTICĂ","أبحاث إحصائية"],
    ["PIANO","PIAN","البيانو"],
    ["PHOTOGRAPHY","FOTOGRAFIE","التصوير"],
    ["CONTACT","CONTACT","اتصل بي"],
    ["PROFILE","PROFIL","الملف الشخصي"],
    ["DESIGN / WORK ↗","DESIGN / LUCRĂRI ↗","تصميم / أعمال ↗"],
    ["STATISTICS / RESEARCH ↗","STATISTICĂ / CERCETARE ↗","إحصاء / أبحاث ↗"],
    ["01 / ABOUT NOOR","01 / DESPRE NOOR","01 / عن نور"],
    ["DESIGN · CODE · RESEARCH · MANAGER · ENTREPRENEUR","DESIGN · COD · CERCETARE · MANAGER · ANTREPRENOR","تصميم · برمجة · أبحاث · إدارة · ريادة أعمال"],
    ["CURRENTLY","ÎN PREZENT","حاليًا"],
    ["Designing for web and apps, maintaining the IDRL website, and learning with every project.","Creez design pentru web și aplicații, întrețin site-ul IDRL și învăț din fiecare proiect.","أصمم للويب والتطبيقات، وأدير موقع IDRL وأتعلم مع كل مشروع."],
    ["STUDY / FINAL YEAR","STUDII / ULTIMUL AN","STUDIU / السنة الأخيرة"],
    ["Economics Informatics student at ASE Bucharest.","Student la Informatică Economică la ASE București.","طالب في المعلوماتية الاقتصادية بجامعة بوخارست للدراسات الاقتصادية."],
    ["I design and build websites, apps, and visual identities, study economics and statistics, and run a small retail shop. Away from work, I like playing piano and photographing the details people often pass by.","Creez site-uri, aplicații și identități vizuale, studiez economia și statistica și administrez un mic magazin. În afara muncii, îmi place să cânt la pian și să fotografiez detaliile pe lângă care oamenii trec adesea.","أصمم وأبني المواقع والتطبيقات والهويات البصرية، وأدرس الاقتصاد والإحصاء، وأدير متجرًا صغيرًا. وفي وقت فراغي أحب العزف على البيانو وتصوير التفاصيل التي قد يغفل عنها الناس."],
    ["I’m Noor, a designer and developer who likes turning ideas into useful digital things.","Sunt Noor, designer și dezvoltator căruia îi place să transforme ideile în lucruri digitale utile.","أنا نور، مصمم ومطور أحب تحويل الأفكار إلى أشياء رقمية مفيدة."],
    ["I design websites, apps, software and logos, and build ideas into working digital products. I also enjoy experimenting with vibe coding. At Informality, I led the design of the website and visual identity for the Informality Data Research Lab.","Creez site-uri, aplicații, software și logo-uri și transform ideile în produse digitale funcționale. Îmi place și să experimentez cu vibe coding. La Informality, am coordonat designul site-ului și al identității vizuale pentru Informality Data Research Lab.","أصمم المواقع والتطبيقات والبرمجيات والشعارات، وأحوّل الأفكار إلى منتجات رقمية عملية. وأستمتع أيضًا بتجارب البرمجة الإبداعية. في Informality، قدت تصميم الموقع والهوية البصرية لمختبر أبحاث بيانات الاقتصاد غير الرسمي."],
    ["I’m from Baghdad and study in Bucharest. My work brings together visual design, development, and animation.","Sunt din Bagdad și studiez în București. Munca mea reunește design vizual, dezvoltare și animație.","أنا من بغداد وأدرس في بوخارست. يجمع عملي بين التصميم البصري والتطوير والرسوم المتحركة."],
    ["I’m studying Economics Informatics at the Bucharest University of Economic Studies. I’d like to become a data analyst in the future, and I’m especially interested in using statistics to study Iraq’s shadow economy.","Studiez Informatică Economică la Academia de Studii Economice din București. Mi-ar plăcea să devin analist de date și mă interesează în mod special folosirea statisticii pentru a studia economia subterană din Irak.","أدرس المعلوماتية الاقتصادية في أكاديمية بوخارست للدراسات الاقتصادية. أطمح إلى العمل محلل بيانات، ويهمني خصوصًا استخدام الإحصاء لدراسة الاقتصاد الخفي في العراق."],
    ["I’m fluent in Arabic, English and Romanian.","Vorbesc fluent araba, engleza și româna.","أتحدث العربية والإنجليزية والرومانية بطلاقة."],
    ["WORK & PROJECTS","LUCRĂRI ȘI PROIECTE","الأعمال والمشاريع"],
    ["What Noor","Noor","نور"],
    ["works on.","lucrează.","يعمل."],
    ["A mix of visual design, digital products, and statistical research into economic and social questions.","Un amestec de design vizual, produse digitale și cercetare statistică asupra unor întrebări economice și sociale.","مزيج من التصميم البصري والمنتجات الرقمية والأبحاث الإحصائية حول قضايا اقتصادية واجتماعية."],
    ["Informality Data Research Lab","Informality Data Research Lab","مختبر أبحاث بيانات الاقتصاد غير الرسمي"],
    ["Noor led the design of the lab’s website and visual identity. He also contributes as a web developer and app and software designer.","Noor a coordonat designul site-ului și al identității vizuale a laboratorului. Contribuie și ca dezvoltator web și designer de aplicații și software.","قاد نور تصميم موقع المختبر وهويته البصرية، ويساهم أيضًا كمطور ويب ومصمم للتطبيقات والبرمجيات."],
    ["VIEW NOOR’S PROFILE AT INFORMALITY ↗","VEZI PROFILUL LUI NOOR LA INFORMALITY ↗","شاهد ملف نور على Informality ↗"],
    ["VIEW IDRL IDENTITY DESIGN ↗","VEZI DESIGNUL IDENTITĂȚII IDRL ↗","شاهد تصميم هوية IDRL ↗"],
    ["Research & data","Cercetare și date","أبحاث وبيانات"],
    ["Explore Noor’s research projects, data, and presentations across economics, statistics, and social change.","Descoperă proiectele de cercetare, datele și prezentările lui Noor despre economie, statistică și schimbare socială.","استكشف أبحاث نور وبياناته وعروضه في الاقتصاد والإحصاء والتغيير الاجتماعي."],
    ["Inside Noor’s","În atelierul de","داخل ورشة"],
    ["design workshop","design a lui Noor","التصميم لدى نور"],
    ["Explore Noor’s design ideas and creations, from early experiments to finished digital work.","Descoperă ideile și creațiile de design ale lui Noor, de la experimente timpurii la proiecte digitale finalizate.","اكتشف أفكار نور وأعماله التصميمية، من التجارب الأولى إلى الأعمال الرقمية المكتملة."],
    ["Noor’s","ale lui Noor","الخاصة بنور"],
    ["hobbies.","pasiuni.","هوايات."],
    ["Piano","Pian","البيانو"],
    ["Noor has learned “Melting” by Evgeny Grinko.","Noor a învățat piesa „Melting” de Evgeny Grinko.","تعلّم نور مقطوعة «Melting» للمؤلف إيفغيني غرينكو."],
    ["Photography","Fotografie","التصوير"],
    ["Noor loves taking pictures and noticing the details in a place.","Lui Noor îi place să fotografieze și să observe detaliile unui loc.","يحب نور التقاط الصور وملاحظة تفاصيل الأماكن."],
    ["Research & design","Cercetare și design","أبحاث وتصميم"],
    ["CONTACT NOOR","CONTACTEAZĂ-L PE NOOR","تواصل مع نور"],
    ["Contact","Contact","اتصل"],
    ["For design, development, animation, other work, or just to chat :D","Pentru design, dezvoltare, animație, alte proiecte sau doar pentru o conversație :D","للتصميم أو التطوير أو الرسوم المتحركة أو أي عمل آخر، أو لمجرد الدردشة :D"],
    ["EMAIL","E-MAIL","البريد الإلكتروني"],
    ["PHONE","TELEFON","الهاتف"],
    ["LINKEDIN","LINKEDIN","لينكدإن"],
    ["INFORMALITY.RO","INFORMALITY.RO","INFORMALITY.RO"],
    ["Noor’s profile","Profilul lui Noor","الملف الشخصي لنور"],
    ["From sketch","De la schiță","من الرسم الأولي"],
    ["to screen.","la ecran.","إلى الشاشة."],
    ["Noor designs and builds websites, app and software interfaces, logos, visual identities, and animation. The work moves between quick sketches and finished digital experiences.","Noor proiectează și creează site-uri, interfețe pentru aplicații și software, logo-uri, identități vizuale și animații. Lucrările trec de la schițe rapide la experiențe digitale finalizate.","يصمم نور مواقع وواجهات للتطبيقات والبرمجيات وشعارات وهويات بصرية ورسومًا متحركة. ينتقل العمل من الرسومات السريعة إلى تجارب رقمية مكتملة."],
    ["BACK TO SELECTED WORK ↙","ÎNAPOI LA PROIECTELE SELECTATE ↙","العودة إلى الأعمال المختارة ↙"],
    ["A SELECTED PROJECT","UN PROIECT SELECTAT","مشروع مختار"],
    ["One identity,","O identitate,","هوية واحدة،"],
    ["many touchpoints.","multe puncte de contact.","عبر نقاط تواصل عديدة."],
    ["Noor’s design work spans the visual system, the screen, and the small details that make a project feel connected.","Munca de design a lui Noor cuprinde identitatea vizuală, interfața și detaliile care fac un proiect unitar.","يشمل تصميم نور الهوية البصرية والواجهة والتفاصيل الصغيرة التي تجعل المشروع متكاملًا."],
    ["Informality Data Research Lab","Informality Data Research Lab","مختبر أبحاث بيانات الاقتصاد غير الرسمي"],
    ["Explore the identity I created for the lab, from logo concepts and the visual theme to type hierarchy, digital applications, and a logo animation.","Descoperă identitatea creată de mine pentru laborator: de la conceptele de logo și tema vizuală la ierarhia tipografică, aplicațiile digitale și animația logo-ului.","استكشف الهوية التي صممتها للمختبر، من أفكار الشعار والموضوع البصري إلى التسلسل الطباعي والتطبيقات الرقمية وتحريك الشعار."],
    ["EXPLORE IDRL DESIGN CASE STUDY ↗","EXPLOREAZĂ STUDIUL DE CAZ IDRL ↗","استكشف دراسة حالة تصميم IDRL ↗"],
    ["NOOR’S INFORMALITY PROFILE ↗","PROFILUL LUI NOOR LA INFORMALITY ↗","ملف نور على Informality ↗"],
    ["VISIT INFORMALITY.RO ↗","VIZITEAZĂ INFORMALITY.RO ↗","زر INFORMALITY.RO ↗"],
    ["WHAT NOOR MAKES","CE CREEAZĂ NOOR","ما الذي يصممه نور"],
    ["Design across","Design dincolo de","تصميم عبر"],
    ["different tools.","instrumente diferite.","أدوات مختلفة."],
    ["Websites & interfaces","Site-uri și interfețe","مواقع وواجهات"],
    ["Web design and development, app screens, and software interfaces shaped from a first layout through to a working product.","Design și dezvoltare web, ecrane de aplicații și interfețe software, de la primul layout până la un produs funcțional.","تصميم الويب وتطويره، وشاشات التطبيقات وواجهات البرمجيات، من التخطيط الأول إلى المنتج العملي."],
    ["Logos & visual systems","Logo-uri și sisteme vizuale","الشعارات والأنظمة البصرية"],
    ["Logo design and visual identity that give a project a recognizable mark, color, and style.","Designul de logo și identitatea vizuală oferă unui proiect un simbol, o culoare și un stil recognoscibil.","يمنح تصميم الشعار والهوية البصرية المشروع علامة وألوانًا وأسلوبًا يسهل تمييزه."],
    ["Animation & motion","Animație și mișcare","الرسوم المتحركة والحركة"],
    ["Animated details and moving graphics that bring interfaces and visual ideas to life.","Detalii animate și elemente grafice în mișcare care dau viață interfețelor și ideilor vizuale.","تفاصيل متحركة ورسومات نابضة بالحركة تمنح الواجهات والأفكار البصرية حياة."],
    ["Sketches & experiments","Schițe și experimente","رسومات وتجارب"],
    ["Loose concepts and vibe coding experiments used to explore directions before they become finished work.","Concepte libere și experimente de vibe coding pentru explorarea direcțiilor înainte ca acestea să devină lucrări finalizate.","أفكار أولية وتجارب برمجة إبداعية لاستكشاف الاتجاهات قبل تحويلها إلى أعمال مكتملة."],
    ["A fashion mark,","Un semn vestimentar,","علامة أزياء،"],
    ["stripped back.","redus la esență.","بأبسط صورة."],
    ["UMME explores the simple, editorial feel of contemporary fashion identities through a compact wordmark and monogram.","UMME explorează simplitatea editorială a identităților de modă contemporane printr-un wordmark compact și o monogramă.","تستكشف UMME الطابع التحريري البسيط لهويات الأزياء المعاصرة عبر شعار نصي موجز وعلامة مختصرة."],
    ["Quiet confidence in four letters.","Încredere discretă în patru litere.","ثقة هادئة في أربعة أحرف."],
    ["A simple identity study for a fashion label, inspired by the clean, minimal presentation of brands such as Zara. The full UMME wordmark carries the name; a compact UM monogram gives the identity a smaller companion for labels and digital use.","Un studiu simplu de identitate pentru un brand de modă, inspirat de prezentarea curată și minimalistă a unor branduri precum Zara. Wordmark-ul UMME redă numele complet, iar monograma UM oferă o versiune compactă pentru etichete și mediul digital.","دراسة هوية بسيطة لعلامة أزياء، مستوحاة من العرض النظيف والمختزل لعلامات مثل Zara. يحمل الشعار النصي اسم UMME كاملًا، وتوفر علامة UM المختصرة نسخة مناسبة للملصقات والاستخدام الرقمي."],
    ["ILLUSTRATOR FILE ↓","FIȘIER ILLUSTRATOR ↓","ملف Illustrator ↓"],
    ["HAVE A PROJECT IN MIND?","AI UN PROIECT ÎN MINTE?","هل لديك مشروع في بالك؟"],
    ["Numbers tell","Numerele spun","الأرقام تحكي"],
    ["stories.","povești.","قصصًا."],
    ["Noor studies Economics Informatics and is interested in economic, social and statistical questions, especially Iraq’s shadow economy. He shares college work here alongside data, ideas and other things he researches or makes.","Noor studiază Informatică Economică și este interesat de întrebări economice, sociale și statistice, în special de economia subterană din Irak. Aici își prezintă proiectele universitare alături de date, idei și alte lucruri pe care le cercetează sau creează.","يدرس نور المعلوماتية الاقتصادية ويهتم بالقضايا الاقتصادية والاجتماعية والإحصائية، وخصوصًا الاقتصاد الخفي في العراق. يشارك هنا أعماله الجامعية إلى جانب البيانات والأفكار وأشياء أخرى يبحث فيها أو ينفذها."],
    ["SELECTED RESEARCH","CERCETARE SELECTATĂ","أبحاث مختارة"],
    ["Corruption,","Corupție,","الفساد،"],
    ["protest & migration.","protest și migrație.","والاحتجاج والهجرة."],
    ["Research by Noor, including collaborative work and independent studies. This project with his colleague David examines connections between corruption, protest, and migration.","Cercetare realizată de Noor, atât în colaborare, cât și independent. Acest proiect, realizat împreună cu colegul său David, analizează legăturile dintre corupție, protest și migrație.","أبحاث نور تشمل أعمالًا تعاونية ودراسات مستقلة. يبحث هذا المشروع، الذي أنجزه مع زميله David، الروابط بين الفساد والاحتجاج والهجرة."],
    ["Shifting Shadows","Shifting Shadows","Shifting Shadows"],
    ["This collaborative study asks how corruption perceptions, recorded protest activity and emigration totals vary together across countries. It combines descriptive statistics, tests and regression, with notes on its samples and limitations.","Acest studiu colaborativ analizează cum variază împreună percepțiile despre corupție, protestele înregistrate și emigrația în diferite țări. Combină statistici descriptive, teste și regresie și descrie eșantioanele și limitele analizei.","تبحث هذه الدراسة التعاونية في تباين تصورات الفساد والاحتجاجات المسجلة وأعداد الهجرة بين البلدان. وتجمع بين الإحصاء الوصفي والاختبارات والانحدار، مع توضيح العينات والقيود."],
    ["PROJECT THEMES","TEMELE PROIECTULUI","موضوعات المشروع"],
    ["QUESTIONS NOOR FOLLOWS","ÎNTREBĂRI PE CARE LE URMĂREȘTE NOOR","قضايا يتابعها نور"],
    ["More than","Mai mult decât","أكثر من"],
    ["the numbers.","cifrele.","الأرقام."],
    ["Shadow economy, with a focus on Iraq","Economia subterană, cu accent pe Irak","الاقتصاد الخفي، مع التركيز على العراق"],
    ["An ongoing interest in informal economic activity in Iraq and how evidence can help describe its scale and impact.","Un interes constant pentru activitatea economică informală din Irak și pentru modul în care datele îi pot descrie dimensiunea și impactul.","اهتمام مستمر بالنشاط الاقتصادي غير الرسمي في العراق وكيف تساعد الأدلة على وصف حجمه وأثره."],
    ["Statistics & evidence","Statistică și dovezi","الإحصاء والأدلة"],
    ["Noor enjoys studying statistics and using data to investigate patterns in economic and social life.","Lui Noor îi place să studieze statistica și să folosească datele pentru a cerceta tipare din viața economică și socială.","يستمتع نور بدراسة الإحصاء واستخدام البيانات لفحص الأنماط في الحياة الاقتصادية والاجتماعية."],
    ["Economics Informatics","Informatică Economică","المعلوماتية الاقتصادية"],
    ["His studies at the Bucharest University of Economic Studies connect economics with information systems and analysis.","Studiile sale la Academia de Studii Economice din București conectează economia cu sistemele informaționale și analiza.","تربط دراسته في أكاديمية بوخارست للدراسات الاقتصادية بين الاقتصاد ونظم المعلومات والتحليل."],
    ["RESEARCH PROJECTS","PROIECTE DE CERCETARE","مشاريع بحثية"],
    ["Research projects","Proiecte de cercetare","مشاريع بحثية"],
    ["Coursework, personal research and projects in systems design. Each page includes a clear summary and links to the available report, data or presentation.","Proiecte universitare, cercetare personală și proiecte de proiectare a sistemelor. Fiecare pagină include un rezumat clar și linkuri către raportul, datele sau prezentarea disponibile.","أعمال دراسية وأبحاث شخصية ومشاريع في تصميم الأنظمة. تتضمن كل صفحة ملخصًا واضحًا وروابط إلى التقرير أو البيانات أو العرض المتاح."],
    ["METHOD","METODĂ","المنهج"],
    ["PRESENTATION","PREZENTARE","العرض"],
    ["STATUS","STATUT","الحالة"],
    ["FOCUS","FOCUS","التركيز"],
    ["CONTEXT","CONTEXT","السياق"],
    ["SCHEMA","SCHEMĂ","المخطط"],
    ["DOCUMENT","DOCUMENT","الوثيقة"],
    ["QUESTION","ÎNTREBARE","السؤال"],
    ["PAGE","PAGINĂ","الصفحة"],
    ["MATERIALS","MATERIALE","المواد"],
    ["FORMATS","FORMATE","الصيغ"],
    ["EXPLORE THE STUDY ↗","EXPLOREAZĂ STUDIUL ↗","استكشف الدراسة ↗"],
    ["VIEW PROJECT PLAN ↗","VEZI PLANUL PROIECTULUI ↗","اعرض خطة المشروع ↗"],
    ["OPEN DATA NOTE ↗","DESCHIDE NOTA DE DATE ↗","افتح مذكرة البيانات ↗"],
    ["EXPLORE THE INTERNSHIP ↗","EXPLOREAZĂ STAGIUL ↗","استكشف التدريب ↗"],
    ["EXPLORE THE DATABASE ↗","EXPLOREAZĂ BAZA DE DATE ↗","استكشف قاعدة البيانات ↗"],
    ["EXPLORE PL/SQL PROJECT ↗","EXPLOREAZĂ PROIECTUL PL/SQL ↗","استكشف مشروع PL/SQL ↗"],
    ["PIANO ROOM","CAMERA DE PIAN","غرفة البيانو"],
    ["LISTEN CLOSELY","ASCULTĂ CU ATENȚIE","استمع بانتباه"],
    ["Noor at the","Noor la","نور عند"],
    ["Piano","pian","البيانو"],
    ["A small collection of piano pieces Noor has learned and ideas he has played for himself. Press play and watch the notes move with the sound.","O mică selecție de piese de pian învățate de Noor și idei cântate pentru sine. Apasă redarea și urmărește notele în ritmul muzicii.","مجموعة صغيرة من مقطوعات البيانو التي تعلمها نور وأفكار عزفها لنفسه. اضغط تشغيل وشاهد النغمات تتحرك مع الصوت."],
    ["BACK TO NOOR’S SITE ↙","ÎNAPOI LA SITE-UL LUI NOOR ↙","العودة إلى موقع نور ↙"],
    ["PIANO PIECES · LEARNED & IMPROVISED","PIESE DE PIAN · ÎNVĂȚATE ȘI IMPROVIZATE","مقطوعات بيانو · متعلمة ومرتجلة"],
    ["Noor’s","ale lui Noor","الخاصة بنور"],
    ["pieces.","piese.","مقطوعات."],
    ["Noor is new to piano and still has a long way to go. Playing is a hobby that gives him a little calm in a busy life. Here he shares pieces he is learning and ideas he plays for himself.","Noor abia a început să cânte la pian și mai are multe de învățat. Cântatul îi aduce puțină liniște într-o viață aglomerată. Aici împărtășește piese pe care le învață și idei cântate pentru sine.","نور مبتدئ في العزف على البيانو وما زال أمامه طريق طويل. تمنحه هذه الهواية بعض الهدوء وسط حياة مزدحمة. يشارك هنا مقطوعات يتعلمها وأفكارًا يعزفها لنفسه."],
    ["READY TO PLAY","GATA DE REDARE","جاهز للتشغيل"],
    ["LIVE AUDIO DISPLAY","VIZUALIZARE AUDIO LIVE","عرض صوتي مباشر"],
    ["88-KEY MIDI VIEW","VIZUALIZARE MIDI CU 88 DE CLAPE","عرض MIDI بـ 88 مفتاحًا"],
    ["NOTES LIGHT UP WITH THE TRACK","NOTELE SE APRIND ÎN RITMUL PIESEI","تضيء النغمات مع المقطوعة"],
    ["LEARNED PIECE · EVGENY GRINKO · 150 BPM","PIESĂ ÎNVĂȚATĂ · EVGENY GRINKO · 150 BPM","مقطوعة متعلمة · إيفغيني غرينكو · 150 نبضة/دقيقة"],
    ["IMPROVISED PIECE BY NOOR · 80 BPM","PIESĂ IMPROVIZATĂ DE NOOR · 80 BPM","مقطوعة مرتجلة من نور · 80 نبضة/دقيقة"],
    ["IMPROVISED PIECE BY NOOR · 88 BPM","PIESĂ IMPROVIZATĂ DE NOOR · 88 BPM","مقطوعة مرتجلة من نور · 88 نبضة/دقيقة"],
    ["IMPROVISED PIECE BY NOOR · 92 BPM","PIESĂ IMPROVIZATĂ DE NOOR · 92 BPM","مقطوعة مرتجلة من نور · 92 نبضة/دقيقة"],
    ["DOWNLOAD MP3 ↓","DESCARCĂ MP3 ↓","نزّل MP3 ↓"],
    ["DOWNLOAD MIDI ↓","DESCARCĂ MIDI ↓","نزّل MIDI ↓"],
    ["PLAY","REDARE","تشغيل"],
    ["PHOTOGRAPHY","FOTOGRAFIE","التصوير"],
    ["STREET · LIGHT · DETAIL","STRADĂ · LUMINĂ · DETALIU","شارع · ضوء · تفاصيل"],
    ["LOOK","PRIVEȘTE","انظر"],
    ["CLOSER","MAI DE APROAPE","عن قرب"],
    ["Noor’s","ale lui Noor","الخاصة بنور"],
    ["Photo Gallery","Galerie foto","معرض الصور"],
    ["Street scenes, changing light, and small details, photographed by Noor across 2023–2025.","Scene de stradă, lumină schimbătoare și mici detalii fotografiate de Noor între 2023 și 2025.","مشاهد شوارع وضوء متغير وتفاصيل صغيرة صورها نور بين عامي 2023 و2025."],
    ["SMALL DETAILS · FAMILIAR PLACES · OPEN SKIES","DETALII MICI · LOCURI FAMILIARE · CER DESCHIS","تفاصيل صغيرة · أماكن مألوفة · سماء مفتوحة"],
    ["THINGS WORTH REMEMBERING","LUCRURI DEMNE DE PĂSTRAT ÎN AMINTIRE","لحظات تستحق التذكر"],
    ["A closer","O privire","نظرة"],
    ["look.","mai atentă.","عن قرب."],
    ["Small details, familiar places, open skies and evening light. Select any frame to view it full size and move through the collection.","Detalii mici, locuri familiare, cer deschis și lumină de seară. Selectează orice fotografie pentru a o vedea la dimensiune completă și a parcurge colecția.","تفاصيل صغيرة وأماكن مألوفة وسماء مفتوحة وضوء المساء. اختر أي صورة لمشاهدتها بالحجم الكامل والتنقل بين الصور."],
    ["THE FULL COLLECTION","COLECȚIA COMPLETĂ","المجموعة كاملة"],
    ["DOWNLOAD ALL PHOTOS","DESCARCĂ TOATE FOTOGRAFIILE","نزّل كل الصور"],
    ["DOWNLOAD","DESCARCĂ","تنزيل"],
    ["CLOSE","ÎNCHIDE","إغلاق"],
    ["DOWNLOAD PHOTO","DESCARCĂ FOTOGRAFIA","نزّل الصورة"],
    ["FRAME","CADRU","إطار"],
    ["UNDATED","FĂRĂ DATĂ","غير مؤرخ"],
    ["DATE NOT RECORDED","DATA NU A FOST ÎNREGISTRATĂ","لم يُسجل التاريخ"],
    ["01 / THE START","01 / ÎNCEPUTUL","01 / البداية"],
    ["A PERSONAL SPACE, NOT A LINK LIST","UN SPAȚIU PERSONAL, NU O LISTĂ DE LINKURI","مساحة شخصية، لا قائمة روابط"],
    ["THE IDEA","IDEA","الفكرة"],
    ["One place for","Un loc pentru","مكان واحد لـ"],
    ["the work and","muncă și","العمل و"],
    ["the life around it.","viața din jurul ei.","الحياة من حوله."],
    ["I’m Noor, a designer and developer. I wanted the site to feel like a small portrait of me: what I make, what I explore, and what I enjoy away from work.","Sunt Noor, designer și dezvoltator. Am vrut ca site-ul să fie un mic portret al meu: ceea ce creez, explorez și îmi place să fac în afara muncii.","أنا نور، مصمم ومطور. أردت أن يكون الموقع صورة صغيرة عني: ما أصنعه وأستكشفه وما أحب فعله بعيدًا عن العمل."],
    ["That meant bringing web and visual design, economics and statistics, piano, and photography into one experience. Each part needed room to be itself while still feeling like it belonged to the same person.","Asta a însemnat să reunesc designul web și vizual, economia și statistica, pianul și fotografia într-o singură experiență. Fiecare parte are locul ei, dar toate aparțin aceleiași persoane.","يعني ذلك جمع تصميم الويب والتصميم البصري والاقتصاد والإحصاء والبيانو والتصوير في تجربة واحدة. لكل جزء مساحته، مع بقائه جزءًا من صورة الشخص نفسه."],
    ["THE DESIGN INTENT","INTENȚIA DE DESIGN","هدف التصميم"],
    ["Bring my interests into one place while keeping each part clear, considered, and unmistakably mine.","Să-mi adun interesele într-un singur loc, păstrând fiecare parte clară, atent construită și inconfundabil a mea.","جمع اهتماماتي في مكان واحد مع الحفاظ على وضوح كل جزء وعنايته وطابعه الذي يعبر عني."],
    ["HOW IT TOOK SHAPE","CUM A PRINS FORMĂ","كيف تشكل الموقع"],
    ["Four choices","Patru alegeri","أربعة خيارات"],
    ["made it","l-au făcut","جعلته"],
    ["personal.","personal.","شخصيًا."],
    ["The website grew by connecting its content, visual language, navigation, and small interactive details into one system.","Site-ul s-a dezvoltat prin conectarea conținutului, limbajului vizual, navigării și micilor detalii interactive într-un singur sistem.","نما الموقع عبر ربط محتواه ولغته البصرية والتنقل فيه وتفاصيله التفاعلية الصغيرة ضمن نظام واحد."],
    ["START WITH WHAT’S REAL","PORNEȘTE DE LA CE ESTE REAL","ابدأ بما هو حقيقي"],
    ["Make room for the whole picture.","Fă loc întregii imagini.","اترك مساحة للصورة كاملة."],
    ["Design, research, piano, and photography each have their own space, so visitors can follow what interests them without losing the sense that it all belongs to one person.","Designul, cercetarea, pianul și fotografia au fiecare spațiul lor, iar vizitatorii pot urmări ce îi interesează fără să uite că totul aparține aceleiași persoane.","للتصميم والأبحاث والبيانو والتصوير مساحات مستقلة، فيستطيع الزوار متابعة ما يهمهم مع إدراك أن كل ذلك يخص شخصًا واحدًا."],
    ["BUILD A VISUAL LANGUAGE","CONSTRUIEȘTE UN LIMBAJ VIZUAL","ابنِ لغة بصرية"],
    ["Keep the structure clear and the details expressive.","Păstrează structura clară și detaliile expresive.","حافظ على وضوح البنية وتعبير التفاصيل."],
    ["Deep green-black surfaces, warm paper tones, wine-red highlights, and teal accents give the pages a shared visual rhythm. Oversized serif headings bring character; compact labels keep the interface precise.","Suprafețele verde-negru închis, tonurile calde de hârtie, accentele vișinii și detaliile turcoaz dau paginilor un ritm vizual comun. Titlurile serif mari adaugă caracter, iar etichetele compacte păstrează interfața precisă.","تمنح الخلفيات الخضراء السوداء الداكنة ودرجات الورق الدافئة ولمسات العنابي والتركواز إيقاعًا بصريًا مشتركًا للصفحات. تضيف العناوين الكبيرة ذات الزخرفة طابعًا مميزًا، وتحافظ التسميات المقتضبة على دقة الواجهة."],
    ["MAKE SPACE TO EXPLORE","LASĂ LOC EXPLORĂRII","اترك مساحة للاستكشاف"],
    ["Let every interest have a clear path.","Lasă fiecărui interes un drum clar.","امنح كل اهتمام مسارًا واضحًا."],
    ["The side navigation stays familiar as the pages change. Sections, cards, and small labels help people understand where they are and where a link will take them.","Navigarea laterală rămâne familiară pe măsură ce se schimbă paginile. Secțiunile, cardurile și etichetele mici îi ajută pe oameni să înțeleagă unde sunt și unde îi duce un link.","يبقى التنقل الجانبي مألوفًا مع تغيّر الصفحات. وتساعد الأقسام والبطاقات والتسميات الصغيرة على فهم مكان الزائر والوجهة التي يقود إليها الرابط."],
    ["ADD MOVEMENT WITH PURPOSE","ADĂUGĂ MIȘCARE CU SCOP","أضف الحركة بهدف"],
    ["Let small details bring the site to life.","Lasă detaliile mici să dea viață site-ului.","دع التفاصيل الصغيرة تبث الحياة في الموقع."],
    ["Hover states, motion, the piano-note visualizer, and photography give the experience energy while keeping the content easy to read.","Stările la trecerea cursorului, animațiile, vizualizatorul notelor de pian și fotografiile dau energie experienței, păstrând conținutul ușor de citit.","تمنح حالات التمرير والحركة وعارض نغمات البيانو والتصوير التجربة حيوية مع إبقاء المحتوى سهل القراءة."],
    ["THE DESIGN LANGUAGE","LIMBAJUL DE DESIGN","لغة التصميم"],
    ["A system with a point of view.","Un sistem cu personalitate.","نظام له وجهة نظر."],
    ["Dark, warm, and vivid.","Întunecat, cald și viu.","داكن ودافئ وحيوي."],
    ["Ink and soft charcoal make a quiet base. Paper, wine, and teal add contrast and identity.","Negrul cernelii și cărbunele moale creează o bază discretă. Tonurile de hârtie, vișiniul și turcoazul adaugă contrast și identitate.","يشكل لون الحبر والفحمي الناعم قاعدة هادئة. وتضيف درجات الورق والعنابي والتركواز التباين والهوية."],
    ["Character meets clarity.","Caracter și claritate.","شخصية ووضوح."],
    ["Roboto Slab gives headings their editorial weight. Barlow Condensed keeps body copy direct; IBM Plex Mono adds crisp labels and navigation.","Roboto Slab oferă titlurilor o prezență editorială. Barlow Condensed face textul direct, iar IBM Plex Mono adaugă claritate etichetelor și navigării.","يمنح Roboto Slab العناوين طابعًا تحريريًا، ويحافظ Barlow Condensed على مباشرة النصوص، بينما يضيف IBM Plex Mono وضوحًا للتسميات والتنقل."],
    ["One identity across pages.","O identitate pe toate paginile.","هوية واحدة عبر الصفحات."],
    ["Fine rules, offset color blocks, grain, geometric backdrops, and deliberate spacing make the system feel connected without flattening every page into the same layout.","Liniile fine, blocurile de culoare decalate, textura, fundalurile geometrice și spațierea atentă conectează sistemul fără să uniformizeze toate paginile.","تربط الخطوط الدقيقة وكتل الألوان المتداخلة والحبيبات والخلفيات الهندسية والمسافات المدروسة أجزاء النظام من دون فرض تصميم واحد على كل الصفحات."],
    ["THE SITE, PAGE BY PAGE","SITE-UL, PAGINĂ CU PAGINĂ","الموقع صفحةً صفحة"],
    ["One home. A few different worlds.","O casă. Câteva lumi diferite.","موقع واحد وعوالم مختلفة."],
    ["Each page follows its own subject, while the shared navigation and design details tie the experience together.","Fiecare pagină își urmează subiectul, iar navigarea și detaliile comune de design leagă experiența.","تتبع كل صفحة موضوعها الخاص، بينما يربط التنقل والتصميم المشترك التجربة."],
    ["About Noor","Despre Noor","عن نور"],
    ["The introduction, work, interests, and ways to get in touch.","Prezentare, lucrări, interese și modalități de contact.","نبذة عني وأعمالي واهتماماتي وطرق التواصل."],
    ["Design & digital work","Design și lucrări digitale","التصميم والأعمال الرقمية"],
    ["Visual identity, personal projects, and experiments.","Identitate vizuală, proiecte personale și experimente.","هوية بصرية ومشاريع شخصية وتجارب."],
    ["Research & ideas","Cercetare și idei","أبحاث وأفكار"],
    ["Projects about economics, data, and people.","Proiecte despre economie, date și oameni.","مشاريع عن الاقتصاد والبيانات والناس."],
    ["Piano pieces","Piese de pian","مقطوعات بيانو"],
    ["Music, practice, and a visual piano that follows along.","Muzică, exercițiu și un pian vizual care urmărește interpretarea.","موسيقى وتدريب وبيانو بصري يتابع العزف."],
    ["Photographs","Fotografii","صور"],
    ["Small details, places, and moments worth keeping.","Detalii mici, locuri și momente de păstrat.","تفاصيل صغيرة وأماكن ولحظات تستحق الاحتفاظ بها."],
    ["A SITE THAT KEEPS GROWING","UN SITE CARE CONTINUĂ SĂ CREASCĂ","موقع يواصل النمو"],
    ["The work has a place.","Munca are locul ei.","للعمل مكانه."],
    ["So does the person behind it.","La fel și persoana din spatele ei.","وكذلك الشخص الذي يقف وراءه."],
    ["This is my portfolio, my archive, and a place to keep making things. I hope something here gives you an idea of your own.","Acesta este portofoliul meu, arhiva mea și un loc în care continui să creez. Sper ca ceva de aici să-ți dea o idee proprie.","هذا معرض أعمالي وأرشيفي ومكان أواصل فيه صنع الأشياء. آمل أن يلهمك شيء هنا بفكرة تخصك."],
    ["EXPLORE DESIGN WORK","EXPLOREAZĂ LUCRĂRILE DE DESIGN","استكشف أعمال التصميم"],
    ["GET IN TOUCH","IA LEGĂTURA","تواصل معي"],
    ["A FUN FACT","UN FAPT AMUZANT","معلومة طريفة"],
    ["Three languages, one little corner of the web.","Trei limbi, un mic colț pe internet.","ثلاث لغات، وركن صغير على الإنترنت."],
    ["I made this site speak the three languages I speak: English, Romanian, and Arabic.","Am făcut acest site să vorbească cele trei limbi pe care le vorbesc: engleză, română și arabă.","جعلت هذا الموقع يتحدث باللغات الثلاث التي أتحدثها: الإنجليزية والرومانية والعربية."],
    ["Switch to Arabic and the layout reads right to left.","Treci la arabă pentru ca paginile să se citească de la dreapta la stânga.","عند اختيار العربية، يصبح اتجاه الصفحات من اليمين إلى اليسار."],
    ["ENGLISH","ENGLEZĂ","الإنجليزية"],
    ["ROMÂNĂ","ROMÂNĂ","الرومانية"],
    ["ARABIC","ARABĂ","العربية"],
    ["A CASE STUDY ABOUT THIS SITE","UN STUDIU DE CAZ DESPRE ACEST SITE","دراسة حالة عن هذا الموقع"],
    ["A website built","Un site creat","موقع صُمم"],
    ["to hold","să cuprindă","ليحتوي على"],
    ["more than work.","mai mult decât munca.","أكثر من العمل."],
    ["I brought design, development, research, piano, and photography into one place, then shaped the experience around how those parts connect.","Am adus designul, dezvoltarea, cercetarea, pianul și fotografia într-un singur loc și am construit experiența în jurul felului în care se leagă.","جمعت التصميم والتطوير والأبحاث والبيانو والتصوير في مكان واحد، ثم صممت التجربة حول الروابط بينها."],
    ["SEE HOW THE SITE CAME TOGETHER","VEZI CUM A LUAT FORMĂ SITE-UL","شاهد كيف تكوّن الموقع"],
    ["Read the story behind Noor’s personal website","Citește povestea din spatele site-ului personal al lui Noor","اقرأ قصة موقع نور الشخصي"],
    ["PERSONAL WORK","LUCRĂRI PERSONALE","أعمال شخصية"],
    ["PERSONAL PROJECTS","PROIECTE PERSONALE","مشاريع شخصية"],
    ["Things I made","Lucruri create","أشياء صنعتها"],
    ["for myself.","pentru mine.","لنفسي."],
    ["Independent explorations and a site built around me: projects shaped by curiosity, visual play, and the things I want to make.","Explorări independente și un site construit în jurul meu: proiecte modelate de curiozitate, joacă vizuală și lucrurile pe care vreau să le creez.","استكشافات مستقلة وموقع يتمحور حولي: مشاريع شكلها الفضول واللعب البصري والأشياء التي أرغب في صنعها."],
    ["OFFICIAL WORK","LUCRĂRI OFICIALE","أعمال رسمية"],
    ["INDEPENDENT WORDMARK STUDY","STUDIU INDEPENDENT DE WORDMARK","دراسة مستقلة لشعار نصي"],
    ["A personal website for bringing my design and development work together with research, music, photography, and the interests that shape me.","Un site personal care adună munca mea de design și dezvoltare alături de cercetare, muzică, fotografie și interesele care mă definesc.","موقع شخصي يجمع أعمالي في التصميم والتطوير مع الأبحاث والموسيقى والتصوير والاهتمامات التي تشكلني."],
    ["Follow the process","Urmărește procesul","تابع مراحل العمل"],
    ["FOLLOW THE PROCESS","URMĂREȘTE PROCESUL","تابع مراحل العمل"],
    ["Built to feel","Creat să","صُمم ليبدو"],
    ["like","semene",""],
    ["me.","cu mine.","مثلي."],
    ["NOOR / SITE STORY","NOOR / POVESTEA SITE-ULUI","نور / قصة الموقع"],
    ["PERSONAL PROJECT · DESIGN · CODE","PROIECT PERSONAL · DESIGN · COD","مشروع شخصي · تصميم · برمجة"],
    ["NOORULDEEN.COM / A PERSONAL SITE","NOORULDEEN.COM / UN SITE PERSONAL","NOORULDEEN.COM / موقع شخصي"],
    ["IDEA / IDENTITY / EXPERIENCE","IDEE / IDENTITATE / EXPERIENȚĂ","فكرة / هوية / تجربة"],
    ["Four choices made it personal.","Patru alegeri l-au făcut personal.","أربعة خيارات جعلته شخصيًا."],
    ["BRAND / IDRL","BRAND / IDRL","العلامة / IDRL"],
    ["A visual identity","O identitate vizuală","هوية بصرية"],
    ["for the","pentru","من أجل"],
    ["shadow economy.","economia subterană.","الاقتصاد الخفي."],
    ["I designed and built a clear, easy-to-navigate website and flexible identity for the Informality Data Research Lab. A simple visual hierarchy helps people explore its research on informal work and economic data.","Am proiectat și construit un site clar, ușor de navigat, și o identitate flexibilă pentru Informality Data Research Lab. O ierarhie vizuală simplă îi ajută pe vizitatori să exploreze cercetările despre munca informală și datele economice.","صممت وبنيت موقعًا واضحًا سهل التنقل وهوية مرنة لمختبر أبحاث بيانات الاقتصاد غير الرسمي. ويساعد التسلسل البصري البسيط الزوار على استكشاف أبحاثه حول العمل غير الرسمي والبيانات الاقتصادية."],
    ["A closer look.","O privire mai atentă.","نظرة عن قرب."],
    ["Personal projects","Proiecte personale","مشاريع شخصية"],
    ["Official work","Lucrări oficiale","أعمال رسمية"],
    ["Three languages","Trei limbi","ثلاث لغات"],
    ["INCSMPS","INCSMPS","INCSMPS"],
    ["IDRL · INCSMPS","IDRL · INCSMPS","IDRL · INCSMPS"],
    ["OFFICIAL DESIGN / IDRL + INCSMPS","DESIGN OFICIAL / IDRL + INCSMPS","تصميم رسمي / IDRL + INCSMPS"],
    ["Research deserves","Cercetarea merită","تستحق الأبحاث"],
    ["clear design.","un design clar.","تصميمًا واضحًا."],
    ["A visual identity for IDRL and a near-complete, multi-page website design concept for INCSMPS.","O identitate vizuală pentru IDRL și un concept de design web aproape finalizat, cu mai multe pagini, pentru INCSMPS.","هوية بصرية لمختبر IDRL ومفهوم تصميم موقع متعدد الصفحات أوشك على الاكتمال لمعهد INCSMPS."],
    ["OFFICIAL PROJECT / WEBSITE DESIGN","PROIECT OFICIAL / DESIGN WEB","مشروع رسمي / تصميم موقع"],
    ["INCSMPS · ROMANIA","INCSMPS · ROMÂNIA","INCSMPS · رومانيا"],
    ["A digital home","Un spațiu digital","مساحة رقمية"],
    ["for research.","pentru cercetare.","للأبحاث."],
    ["A near-complete website concept for the National Scientific Research Institute for Labour and Social Protection, designed as a connected desktop and mobile experience in Figma. The site has not been launched.","Un concept de site aproape finalizat pentru Institutul Național de Cercetare Științifică în Domeniul Muncii și Protecției Sociale, proiectat în Figma ca o experiență coerentă pentru desktop și mobil. Site-ul nu a fost lansat.","مفهوم موقع أوشك على الاكتمال للمعهد الوطني للبحث العلمي في مجال العمل والحماية الاجتماعية، صُمم في Figma كتجربة مترابطة لسطح المكتب والهاتف. لم يُطلق الموقع بعد."],
    ["EXPLORE THE INCSMPS DESIGN","EXPLOREAZĂ DESIGNUL INCSMPS","استكشف تصميم INCSMPS"],
    ["VIEW THE FIGMA FILE","VEZI FIȘIERUL FIGMA","شاهد ملف Figma"],
    ["01 / PROJECTS","01 / PROIECTE","01 / المشاريع"],
    ["Research projects with clear summaries and an easy route to more detail.","Proiecte de cercetare prezentate clar, cu o cale simplă spre mai multe detalii.","مشاريع بحثية بملخصات واضحة وطريق سهل للوصول إلى مزيد من التفاصيل."],
    ["02 / PUBLICATIONS","02 / PUBLICAȚII","02 / المنشورات"],
    ["A quieter editorial layout built to keep reports, studies, and resources legible.","Un layout editorial aerisit, conceput pentru a păstra rapoartele, studiile și resursele ușor de citit.","تنسيق تحريري هادئ يحافظ على وضوح التقارير والدراسات والموارد."],
    ["03 / TEAM & INSTITUTE","03 / ECHIPĂ ȘI INSTITUT","03 / الفريق والمعهد"],
    ["People and institutional information sit within the same navigable system.","Informațiile despre oameni și institut fac parte din același sistem de navigare.","تندرج معلومات الفريق والمؤسسة ضمن نظام تنقل واحد."],
    ["04 / EVENTS","04 / EVENIMENTE","04 / الفعاليات"],
    ["Events and institutional updates have a clear place alongside long-term research.","Evenimentele și noutățile instituționale sunt prezentate alături de cercetarea pe termen lung.","للفعاليات والأخبار المؤسسية مكان واضح إلى جانب الأبحاث طويلة الأمد."],
    ["05 / ABOUT THE INSTITUTE","05 / DESPRE INSTITUT","05 / عن المعهد"],
    ["An introduction to the institute gives its research work a human and organizational context.","Prezentarea institutului oferă contextul uman și organizațional al activității sale de cercetare.","تقدم نبذة عن المعهد السياق الإنساني والتنظيمي لأعماله البحثية."],
    ["06 / CONTACT","06 / CONTACT","06 / التواصل"],
    ["A direct, low-friction route connects researchers, partners, and visitors with the institute.","O cale simplă și directă îi pune în legătură pe cercetători, parteneri și vizitatori cu institutul.","مسار مباشر وسهل يربط الباحثين والشركاء والزوار بالمعهد."],
    ["INCSMPS","INCSMPS","INCSMPS"],
    ["WEBSITE DESIGN","DESIGN WEB","تصميم الموقع"],
    ["NOOR / INCSMPS","NOOR / INCSMPS","نور / INCSMPS"],
    ["WEB DESIGN · UI SYSTEM · RESPONSIVE","DESIGN WEB · SISTEM UI · RESPONSIV","تصميم ويب · نظام واجهة · متجاوب"],
    ["Research, with","Cercetare, cu","بحث، مع"],
    ["room to explore.","spațiu de explorat.","مساحة للاستكشاف."],
    ["A complete website design concept for Romania’s National Scientific Research Institute for Labour and Social Protection, shaped in Figma as a connected set of desktop and mobile pages.","Un concept complet de design pentru site-ul Institutului Național de Cercetare Științifică în Domeniul Muncii și Protecției Sociale, realizat în Figma ca un sistem coerent de pagini desktop și mobile.","تصميم متكامل لموقع المعهد الوطني للبحث العلمي في مجال العمل والحماية الاجتماعية في رومانيا، صُمم في Figma كمجموعة مترابطة من صفحات سطح المكتب والهاتف."],
    ["EXPLORE THE DESIGN","EXPLOREAZĂ DESIGNUL","استكشف التصميم"],
    ["OPEN THE FIGMA FILE","DESCHIDE FIȘIERUL FIGMA","افتح ملف Figma"],
    ["DESIGN CONCEPT · NOT YET LAUNCHED","CONCEPT DE DESIGN · ÎNCĂ NELANSAT","مفهوم تصميم · لم يُطلق بعد"],
    ["INCSMPS / WEBSITE DESIGN CONCEPT","INCSMPS / CONCEPT DE DESIGN WEB","INCSMPS / مفهوم تصميم الموقع"],
    ["INFORMATION / RESEARCH / PEOPLE","INFORMAȚII / CERCETARE / OAMENI","معلومات / أبحاث / أشخاص"],
    ["01 / THE DESIGN","01 / DESIGNUL","01 / التصميم"],
    ["OFFICIAL WORK · INCSMPS","LUCRĂRI OFICIALE · INCSMPS","أعمال رسمية · INCSMPS"],
    ["A MULTI-PAGE INSTITUTIONAL WEBSITE","UN SITE INSTITUȚIONAL CU MAI MULTE PAGINI","موقع مؤسسي متعدد الصفحات"],
    ["A research institute,","Un institut de cercetare,","معهد أبحاث،"],
    ["made easier to explore.","mai ușor de explorat.","أسهل للاستكشاف."],
    ["The design brings the institute’s research, projects, publications, events, and people into one clear digital experience. A steady page structure gives detailed information room to breathe while helping visitors find their way.","Designul reunește cercetarea, proiectele, publicațiile, evenimentele și oamenii institutului într-o experiență digitală clară. O structură consecventă oferă spațiu informațiilor detaliate și îi ajută pe vizitatori să navigheze.","يجمع التصميم أبحاث المعهد ومشاريعه ومنشوراته وفعالياته وفريقه في تجربة رقمية واضحة. يمنح تنظيم الصفحات المعلومات التفصيلية مساحة مناسبة ويساعد الزوار على الوصول لما يبحثون عنه."],
    ["MY ROLE","ROLUL MEU","دوري"],
    ["Website design · UI system","Design web · sistem UI","تصميم الموقع · نظام الواجهة"],
    ["DESIGNED IN","REALIZAT ÎN","صُمم في"],
    ["LAYOUTS","LAYOUT-URI","التخطيطات"],
    ["Desktop + mobile","Desktop + mobil","سطح المكتب + الهاتف"],
    ["STATUS","STATUS","الحالة"],
    ["Design concept · not launched","Concept de design · nelansat","مفهوم تصميم · لم يُطلق"],
    ["HOMEPAGE / DESKTOP","PAGINA PRINCIPALĂ / DESKTOP","الصفحة الرئيسية / سطح المكتب"],
    ["VISUAL STUDY BASED ON THE FIGMA DESIGN","STUDIU VIZUAL BAZAT PE DESIGNUL DIN FIGMA","دراسة بصرية مبنية على تصميم Figma"],
    ["02 / INFORMATION ARCHITECTURE","02 / ARHITECTURA INFORMAȚIEI","02 / بنية المعلومات"],
    ["One institute,","Un institut,","معهد واحد،"],
    ["many paths in.","mai multe căi de acces.","وطرق كثيرة لاستكشافه."],
    ["The file is organized around the ways people approach a research institute: start with the work, explore its output, meet its team, or learn how the organization operates.","Fișierul este organizat în jurul modurilor în care oamenii descoperă un institut de cercetare: activitatea, rezultatele, echipa sau modul de funcționare al organizației.","ينظم الملف وفق الطرق التي يكتشف بها الناس معهد الأبحاث: بدءًا من نشاطه، أو استكشاف نتائجه، أو التعرف إلى فريقه، أو معرفة طريقة عمل المؤسسة."],
    ["01 / PROIECTE","01 / PROIECTE","01 / PROIECTE"],
    ["Research projects with clear summaries and an easy route to more detail.","Proiecte de cercetare prezentate clar, cu o cale simplă spre mai multe detalii.","مشاريع بحثية بملخصات واضحة وطريق سهل للوصول إلى مزيد من التفاصيل."],
    ["02 / PUBLICAȚII","02 / PUBLICAȚII","02 / PUBLICAȚII"],
    ["A quieter editorial layout built to keep reports, studies, and resources legible.","Un layout editorial aerisit, conceput pentru a păstra rapoartele, studiile și resursele ușor de citit.","تنسيق تحريري هادئ يحافظ على وضوح التقارير والدراسات والموارد."],
    ["03 / ECHIPĂ ȘI INSTITUT","03 / ECHIPĂ ȘI INSTITUT","03 / ECHIPĂ ȘI INSTITUT"],
    ["People and institutional information sit within the same navigable system.","Informațiile despre oameni și institut fac parte din același sistem de navigare.","تندرج معلومات الفريق والمؤسسة ضمن نظام تنقل واحد."],
    ["03 / VISUAL LANGUAGE","03 / LIMBAJ VIZUAL","03 / اللغة البصرية"],
    ["Calm structure.","Structură calmă.","تنظيم هادئ."],
    ["Confident colour.","Culoare sigură.","ألوان واثقة."],
    ["A bright, open page canvas supports long-form institutional content. Deep indigo creates strong section markers, with restrained green accents to draw attention to actions and navigation.","Un fundal luminos și aerisit susține conținut instituțional amplu. Indigo-ul intens marchează clar secțiunile, iar accentele verzi discrete atrag atenția asupra acțiunilor și navigării.","توفر الصفحات المضيئة والواسعة مساحة للمحتوى المؤسسي المطول. يحدد النيلي العميق الأقسام بوضوح، بينما تلفت اللمسات الخضراء الهادئة الانتباه إلى الإجراءات والتنقل."],
    ["COLOUR NOTES","NOTE DE CULOARE","ملاحظات الألوان"],
    ["INDIGO","INDIGO","نيلي"],
    ["GREEN","VERDE","أخضر"],
    ["OPEN CANVAS","FUNDAL DESCHIS","مساحة بيضاء"],
    ["01","01","01"],
    ["02","02","02"],
    ["03","03","03"],
    ["Find the next step.","Găsește următorul pas.","اعثر على الخطوة التالية."],
    ["Navigation and page headings create a readable path through a deep set of institutional content.","Navigarea și titlurile paginilor oferă o cale clară prin volumul mare de informații instituționale.","توفر القوائم وعناوين الصفحات مسارًا واضحًا عبر المحتوى المؤسسي الواسع."],
    ["Make research approachable.","Fă cercetarea accesibilă.","اجعل الأبحاث سهلة الوصول."],
    ["Project and publication blocks introduce complex work in smaller, easier-to-scan pieces.","Proiectele și publicațiile prezintă lucrările complexe în fragmente mai mici, ușor de parcurs.","تقدم أقسام المشاريع والمنشورات الأعمال المعقدة في أجزاء أصغر وأسهل للمراجعة."],
    ["Keep the system consistent.","Păstrează coerența sistemului.","حافظ على اتساق النظام."],
    ["Reusable bands, cards, and page patterns give separate sections a shared identity.","Benzile, cardurile și tiparele reutilizabile oferă secțiunilor distincte o identitate comună.","تمنح الأشرطة والبطاقات وأنماط الصفحات القابلة لإعادة الاستخدام الأقسام المنفصلة هوية مشتركة."],
    ["04 / RESPONSIVE THINKING","04 / GÂNDIRE RESPONSIVE","04 / تصميم متجاوب"],
    ["Designed to travel","Proiectat să funcționeze","مصمم ليناسب"],
    ["down to mobile.","și pe mobil.","الهواتف أيضًا."],
    ["The Figma file includes a dedicated 440-pixel mobile homepage. The page shifts from wide editorial layouts into a single, readable column while keeping the institute’s content hierarchy intact.","Fișierul Figma include o pagină principală dedicată pentru mobil, la 440 de pixeli. Aspectul se transformă dintr-un layout editorial lat într-o singură coloană ușor de citit, păstrând ierarhia conținutului institutului.","يتضمن ملف Figma صفحة رئيسية مخصصة للهاتف بعرض 440 بكسل. ينتقل التخطيط من الأعمدة التحريرية الواسعة إلى عمود واحد واضح مع الحفاظ على ترتيب محتوى المعهد."],
    ["440 PX / MOBILE HOME","440 PX / PAGINA PRINCIPALĂ MOBILĂ","440 بكسل / الصفحة الرئيسية للهاتف"],
    ["Same system,","Același sistem,","النظام نفسه،"],
    ["closer reading.","mai ușor de parcurs.","وقراءة أقرب."],
    ["Navigation, headings, and content blocks are re-stacked for a narrower screen. The mobile design preserves the same indigo, green, and white palette while giving each section a comfortable amount of room.","Navigarea, titlurile și blocurile de conținut sunt rearanjate pentru un ecran mai îngust. Designul mobil păstrează aceeași paletă indigo, verde și alb, oferind fiecărei secțiuni spațiu suficient.","أُعيد ترتيب القوائم والعناوين وكتل المحتوى لتناسب الشاشة الأضيق. يحافظ التصميم للهاتف على لوحة النيلي والأخضر والأبيض نفسها ويمنح كل قسم مساحة مريحة."],
    ["SEE THE RESPONSIVE FRAMES","VEZI VARIANTELE RESPONSIVE","شاهد إطارات التصميم المتجاوب"],
    ["THE WORK SO FAR","LUCRAREA DE PÂNĂ ACUM","ما أُنجز حتى الآن"],
    ["A near-complete design,","Un design aproape finalizat,","تصميم أوشك على الاكتمال،"],
    ["ready for its next chapter.","pregătit pentru următorul capitol.","مستعد لخطوته التالية."],
    ["The Figma file brings the INCSMPS website together as a detailed multi-page concept. The design is close to complete, but the website itself has not been launched. I’m sharing the work here as a look at the structure, visual direction, and responsive thinking behind it.","Fișierul Figma reunește site-ul INCSMPS într-un concept detaliat, cu mai multe pagini. Designul este aproape complet, însă site-ul nu a fost lansat. Împărtășesc aici lucrarea pentru a arăta structura, direcția vizuală și gândirea responsive din spatele ei.","يجمع ملف Figma موقع INCSMPS في مفهوم تفصيلي متعدد الصفحات. التصميم قريب من الاكتمال، لكن الموقع نفسه لم يُطلق بعد. أشارك هنا العمل لعرض البنية والتوجه البصري والتفكير المتجاوب وراءه."],
    ["OPEN THE FIGMA DESIGN","DESCHIDE DESIGNUL FIGMA","افتح تصميم Figma"],
    ["BACK TO OFFICIAL WORK","ÎNAPOI LA LUCRĂRILE OFICIALE","العودة إلى الأعمال الرسمية"]
  ];

  entries.forEach((entry) => add(entry[0], entry[1], entry[2]));

  const projectTranslations = [
  [
    "Al Sammarraie Nooruldeen, home",
    "Acasă — Al Sammarraie Nooruldeen",
    "السامرائي نورالدين، الرئيسية"
  ],
  [
    "Informality Data Research Lab",
    "Informality Data Research Lab",
    "Informality Data Research Lab"
  ],
  [
    "DESIGN / AL SAMARRAIE NOORULDEEN",
    "DESIGN / AL SAMARRAIE NOORULDEEN",
    "تصميم / السامرائي نورالدين"
  ],
  [
    "WEB / APP / IDENTITY / MOTION",
    "WEB / APLICAȚII / IDENTITATE / ANIMAȚIE",
    "ويب / تطبيقات / هوية / حركة"
  ],
  [
    "01 / SELECTED PROJECT",
    "01 / PROIECT SELECTAT",
    "01 / مشروع مختار"
  ],
  [
    "OFFICIAL WORK",
    "LUCRĂRI OFICIALE",
    "أعمال رسمية"
  ],
  [
    "OFFICIAL WORK / VISUAL IDENTITY",
    "LUCRĂRI OFICIALE / IDENTITATE VIZUALĂ",
    "أعمال رسمية / هوية بصرية"
  ],
  [
    "OFFICIAL WORK / WEBSITE + IDENTITY",
    "LUCRĂRI OFICIALE / SITE + IDENTITATE",
    "أعمال رسمية / موقع + هوية"
  ],
  [
    "OFFICIAL WORK / WEBSITE DESIGN / FIGMA",
    "LUCRĂRI OFICIALE / DESIGN WEB / FIGMA",
    "أعمال رسمية / تصميم الموقع / FIGMA"
  ],
  [
    "OFFICIAL DESIGN / IDRL + INCSMPS",
    "DESIGN OFICIAL / IDRL + INCSMPS",
    "تصميم رسمي / IDRL + INCSMPS"
  ],
  [
    "A complete website and visual identity for IDRL, alongside a near-complete, multi-page INCSMPS website design.",
    "Un site complet și o identitate vizuală pentru IDRL, alături de designul aproape finalizat al site-ului INCSMPS, cu mai multe pagini.",
    "موقع متكامل وهوية بصرية لمختبر IDRL، إلى جانب تصميم شبه مكتمل ومتعدد الصفحات لموقع INCSMPS."
  ],
  [
    "I designed the complete IDRL website as well as its visual identity, bringing the lab’s research into one clear digital experience.",
    "Am proiectat întregul site IDRL, precum și identitatea sa vizuală, reunind cercetarea laboratorului într-o experiență digitală clară.",
    "صممت موقع IDRL بالكامل إلى جانب هويته البصرية، وجمعت أبحاث المختبر في تجربة رقمية واضحة."
  ],
  [
    "EXPLORE IDRL WEBSITE + IDENTITY",
    "EXPLOREAZĂ SITE-UL ȘI IDENTITATEA IDRL",
    "استكشف موقع IDRL وهويته"
  ],
  [
    "OFFICIAL PROJECT / WEBSITE + IDENTITY",
    "PROIECT OFICIAL / SITE + IDENTITATE",
    "مشروع رسمي / موقع + هوية"
  ],
  [
    "OFFICIAL PROJECT / WEBSITE DESIGN",
    "PROIECT OFICIAL / DESIGN WEB",
    "مشروع رسمي / تصميم موقع"
  ],
  [
    "INCSMPS · ROMANIA",
    "INCSMPS · ROMÂNIA",
    "INCSMPS · رومانيا"
  ],
  [
    "ACTUAL FIGMA FRAME INDEX",
    "INDEXUL REAL AL CADRELOR FIGMA",
    "فهرس الإطارات الفعلي في FIGMA"
  ],
  [
    "7 page frames",
    "7 cadre de pagină",
    "7 إطارات للصفحات"
  ],
  [
    "6 desktop + mobile pairs",
    "6 perechi desktop și mobil",
    "6 أزواج لسطح المكتب والهاتف"
  ],
  [
    "ACASA",
    "ACASĂ",
    "الرئيسية"
  ],
  [
    "MOBILE",
    "MOBIL",
    "الهاتف"
  ],
  [
    "A digital home",
    "Un spațiu digital",
    "مساحة رقمية"
  ],
  [
    "for research.",
    "pentru cercetare.",
    "للأبحاث."
  ],
  [
    "A near-complete website design for the National Scientific Research Institute for Labour and Social Protection. The design covers a seven-page set of desktop and mobile frames; the website has not launched.",
    "Un design aproape finalizat al site-ului Institutului Național de Cercetare Științifică pentru Muncă și Protecție Socială. Proiectul cuprinde șapte pagini pentru desktop și mobil; site-ul nu a fost lansat.",
    "تصميم شبه مكتمل لموقع المعهد الوطني للبحوث العلمية في مجال العمل والحماية الاجتماعية. يشمل التصميم سبع صفحات بإطارات للحاسوب والهاتف؛ ولم يُطلق الموقع."
  ],
  [
    "EXPLORE THE INCSMPS DESIGN",
    "EXPLOREAZĂ DESIGNUL INCSMPS",
    "استكشف تصميم INCSMPS"
  ],
  [
    "INDEPENDENT PROJECTS · MADE BY NOOR",
    "PROIECTE INDEPENDENTE · CREATE DE NOOR",
    "مشاريع مستقلة · من صنع نور"
  ],
  [
    "THINGS I MADE FOR MYSELF.",
    "LUCRURI CREATE PENTRU MINE.",
    "أشياء صنعتها لنفسي."
  ],
  [
    "SEE HOW THE SITE CAME TOGETHER ↗",
    "VEZI CUM A LUAT FORMĂ SITE-UL ↗",
    "شاهد كيف تكوّن الموقع ↗"
  ],
  [
    "PERSONAL STUDY / FASHION WORDMARK",
    "STUDIU PERSONAL / WORDMARK DE MODĂ",
    "دراسة شخصية / شعار نصي للأزياء"
  ],
  [
    "PERSONAL STUDY / 01",
    "STUDIU PERSONAL / 01",
    "دراسة شخصية / 01"
  ],
  [
    "A WEBSITE BUILT TO HOLD MORE THAN WORK.",
    "UN SITE CARE CUPRINDE MAI MULT DECÂT MUNCA.",
    "موقع يجمع أكثر من مجرد العمل."
  ],
  [
    "DESIGN / DIGITAL CRAFT",
    "DESIGN / CREAȚIE DIGITALĂ",
    "تصميم / إبداع رقمي"
  ],
  [
    "BACK TO SELECTED WORK",
    "ÎNAPOI LA PROIECTELE SELECTATE",
    "العودة إلى الأعمال المختارة"
  ],
  [
    "BACK TO SELECTED WORK ↙",
    "ÎNAPOI LA PROIECTELE SELECTATE ↙",
    "العودة إلى الأعمال المختارة ↙"
  ],
  [
    "BACK TO RESEARCH",
    "ÎNAPOI LA CERCETARE",
    "العودة إلى الأبحاث"
  ],
  [
    "A project brief for choosing comparable economic indicators, checking their coverage, and describing change across places and years.",
    "Un rezumat de proiect pentru alegerea unor indicatori economici comparabili, verificarea acoperirii lor și descrierea schimbărilor între regiuni și ani.",
    "موجز مشروع لاختيار مؤشرات اقتصادية قابلة للمقارنة، والتحقق من تغطيتها، ووصف التغير عبر المناطق والسنوات."
  ],
  [
    "A project brief outlining how future analysis could study connections between employment conditions and migration decisions.",
    "موجز مشروع يوضح كيف يمكن لتحليل مستقبلي دراسة الصلات بين ظروف العمل وقرارات الهجرة.",
    "عرض موجز لمشروع يوضح كيف يمكن لتحليل مستقبلي دراسة الروابط بين ظروف التوظيف وقرارات الهجرة."
  ],
  [
    "A research website",
    "Un site de cercetare",
    "موقع للأبحاث"
  ],
  [
    "for the",
    "despre",
    "حول"
  ],
  [
    "shadow economy.",
    "economia informală.",
    "الاقتصاد غير الرسمي."
  ],
  [
    "The complete website,",
    "Întregul site,",
    "الموقع بالكامل،"
  ],
  [
    "designed as one system.",
    "gândit ca un singur sistem.",
    "مصمم كنظام واحد."
  ],
  [
    "The ideas behind",
    "Ideile din spatele",
    "الأفكار وراء"
  ],
  [
    "the mark.",
    "simbolului.",
    "العلامة."
  ],
  [
    "Research, held in one visual system.",
    "Cercetarea, redată într-un sistem vizual unitar.",
    "الأبحاث ضمن نظام بصري واحد."
  ],
  [
    "Several logo",
    "Mai multe variante de logo",
    "عدة نسخ للشعار"
  ],
  [
    "versions to choose from.",
    "din care poți alege.",
    "للاختيار منها."
  ],
  [
    "Emblem + wordmark",
    "Emblemă + wordmark",
    "الشعار الرمزي + الاسم المكتوب"
  ],
  [
    "Recognizable at a glance",
    "Ușor de recunoscut",
    "واضح من النظرة الأولى"
  ],
  [
    "Chart and wordmark.",
    "Grafic și wordmark.",
    "مخطط بياني واسم مكتوب."
  ],
  [
    "Hand and economy.",
    "Mână și economie.",
    "اليد والاقتصاد."
  ],
  [
    "Colour and",
    "Culoare și",
    "الألوان"
  ],
  [
    "backgrounds.",
    "fundaluri.",
    "والخلفيات."
  ],
  [
    "One typeface.",
    "Un singur font.",
    "خط واحد."
  ],
  [
    "Clear levels.",
    "Ierarhie clară.",
    "مستويات واضحة."
  ],
  [
    "Logo motion and",
    "Animația logo-ului și",
    "حركة الشعار"
  ],
  [
    "branded backgrounds.",
    "fundaluri de brand.",
    "وخلفيات الهوية."
  ],
  [
    "The animation,",
    "Animația,",
    "التحريك"
  ],
  [
    "shown in context.",
    "în context.",
    "ضمن سياقه."
  ],
  [
    "I designed this certificate.",
    "Am creat acest certificat.",
    "صممت هذه الشهادة."
  ],
  [
    "Design, development, and care.",
    "Design, dezvoltare și atenție.",
    "التصميم والتطوير والمتابعة."
  ],
  [
    "VIEW FULL CERTIFICATE ↗",
    "VEZI CERTIFICATUL COMPLET ↗",
    "شاهد الشهادة كاملة ↗"
  ],
  [
    "VISIT THE IDRL WEBSITE ↗",
    "VIZITEAZĂ SITE-UL IDRL ↗",
    "زُر موقع IDRL ↗"
  ],
  [
    "VISIT INFORMALITY.RO ↗",
    "VIZITEAZĂ INFORMALITY.RO ↗",
    "زُر INFORMALITY.RO ↗"
  ]
];
  projectTranslations.forEach((entry) => add(entry[0], entry[1], entry[2]));

  const idrlTranslations = [
  [
    "A research website",
    "Un site de cercetare",
    "موقع للأبحاث"
  ],
  [
    "for the",
    "despre",
    "حول"
  ],
  [
    "shadow economy.",
    "economia informală.",
    "الاقتصاد غير الرسمي."
  ],
  [
    "I designed the complete website and visual identity for the Informality Data Research Lab. A clear visual hierarchy helps people explore its research on informal work and economic data.",
    "Am proiectat site-ul complet și identitatea vizuală pentru Informality Data Research Lab. O ierarhie vizuală clară îi ajută pe vizitatori să exploreze cercetările despre munca informală și datele economice.",
    "صممت الموقع بالكامل والهوية البصرية لمختبر Informality Data Research Lab. ويساعد التسلسل البصري الواضح الزوار على استكشاف أبحاثه حول العمل غير الرسمي والبيانات الاقتصادية."
  ],
  [
    "EXPLORE THE PROJECT",
    "EXPLOREAZĂ PROIECTUL",
    "استكشف المشروع"
  ],
  [
    "VISUAL THEME",
    "TEMĂ VIZUALĂ",
    "الطابع البصري"
  ],
  [
    "CERTIFICATE",
    "CERTIFICAT",
    "الشهادة"
  ],
  [
    "00 / WEBSITE DESIGN",
    "00 / DESIGNUL SITE-ULUI",
    "00 / تصميم الموقع"
  ],
  [
    "The complete website,",
    "Site-ul complet,",
    "الموقع بالكامل،"
  ],
  [
    "designed as one system.",
    "proiectat ca un sistem unitar.",
    "مصمم كنظام واحد."
  ],
  [
    "The lab studies informal economies through research and data. I translated its focus on people, work and the economy into a hand-held chart symbol, then developed several logo versions around those ideas for different settings.",
    "Laboratorul studiază economiile informale prin cercetare și date. Am transpus interesul său pentru oameni, muncă și economie într-un simbol cu un grafic susținut de o mână, apoi am creat mai multe variante de logo pentru contexte diferite.",
    "يدرس المختبر الاقتصادات غير الرسمية من خلال الأبحاث والبيانات. وحولت تركيزه على الناس والعمل والاقتصاد إلى رمز بياني تحمله يد، ثم طورت عدة نسخ للشعار تناسب استخدامات مختلفة."
  ],
  [
    "The ideas behind",
    "Ideile din spatele",
    "الأفكار وراء"
  ],
  [
    "the mark.",
    "simbolului.",
    "العلامة."
  ],
  [
    "THE DESIGN IDEA",
    "IDEA DE DESIGN",
    "فكرة التصميم"
  ],
  [
    "Research, held in one visual system.",
    "Cercetarea, într-un sistem vizual unitar.",
    "الأبحاث ضمن نظام بصري واحد."
  ],
  [
    "The hand creates a human foundation for the rising chart and dollar symbol. Together they make a distinct mark for the lab, while the IDRL wordmark keeps the name easy to recognize.",
    "Mâna oferă o bază umană graficului ascendent și simbolului dolarului. Împreună formează un semn distinctiv pentru laborator, iar logotipul IDRL îi păstrează numele ușor de recunoscut.",
    "تمنح اليد أساسًا إنسانيًا للمخطط الصاعد ورمز الدولار. ويشكلان معًا علامة مميزة للمختبر، بينما يحافظ اسم IDRL المكتوب على سهولة التعرف عليه."
  ],
  [
    "I prepared light and dark applications so the identity can sit clearly on both bright and deep-colour surfaces.",
    "Am pregătit versiuni pentru fundaluri deschise și închise, astfel încât identitatea să rămână clară pe suprafețe de ambele tipuri.",
    "أعددت تطبيقات فاتحة وأخرى داكنة لتظل الهوية واضحة على الخلفيات الفاتحة والداكنة."
  ],
  [
    "02 / LOGO DESIGN",
    "02 / DESIGNUL LOGOULUI",
    "02 / تصميم الشعار"
  ],
  [
    "Several logo",
    "Mai multe variante de logo",
    "عدة نسخ للشعار"
  ],
  [
    "versions to choose from.",
    "din care poți alege.",
    "للاختيار منها."
  ],
  [
    "I developed a set of logo variations around the lab’s main ideas. The full wordmark and standalone symbol suit different placements, while the early explorations show how I tested ways to connect data, informal work and research.",
    "Am dezvoltat mai multe variante de logo pornind de la ideile principale ale laboratorului. Logotipul complet și simbolul de sine stătător se potrivesc în contexte diferite, iar explorările timpurii arată cum am căutat să conectez datele, munca informală și cercetarea.",
    "طورت مجموعة من أشكال الشعار انطلاقًا من أفكار المختبر الأساسية. يناسب الاسم المكتوب كاملًا والرمز المستقل مواضع مختلفة، وتوضح التجارب الأولى محاولاتي لربط البيانات والعمل غير الرسمي والأبحاث."
  ],
  [
    "OPEN IMAGE ↗",
    "DESCHIDE IMAGINEA ↗",
    "افتح الصورة ↗"
  ],
  [
    "PRIMARY LOCKUP",
    "COMPOZIȚIA PRINCIPALĂ",
    "التكوين الرئيسي"
  ],
  [
    "Emblem + wordmark",
    "Emblemă + logotip",
    "الرمز + الاسم المكتوب"
  ],
  [
    "The full signature brings the hand-and-chart mark together with the IDRL name for clear, formal placements.",
    "Semnătura completă unește simbolul mâinii și graficului cu numele IDRL, pentru aplicații formale și clare.",
    "يجمع التوقيع الكامل رمز اليد والمخطط مع اسم IDRL للاستخدامات الرسمية والواضحة."
  ],
  [
    "STANDALONE SYMBOL",
    "SIMBOL DE SINE STĂTĂTOR",
    "الرمز المستقل"
  ],
  [
    "Recognizable at a glance",
    "Ușor de recunoscut",
    "سهل التمييز"
  ],
  [
    "The emblem can work without the wordmark when a compact graphic is needed.",
    "Emblema poate fi folosită fără logotip atunci când este nevoie de un element grafic compact.",
    "يمكن استخدام الشعار الرمزي دون الاسم المكتوب عند الحاجة إلى شكل مختصر."
  ],
  [
    "EARLY DIRECTIONS",
    "DIRECȚII TIMPURII",
    "اتجاهات أولية"
  ],
  [
    "DIRECTION A / CHART + WORDMARK",
    "DIRECȚIA A / GRAFIC + LOGOTIP",
    "الاتجاه أ / مخطط + اسم مكتوب"
  ],
  [
    "Chart and wordmark.",
    "Grafic și logotip.",
    "مخطط واسم مكتوب."
  ],
  [
    "This route places a rising chart inside a geometric frame and keeps the initials direct and legible.",
    "Această variantă așază un grafic ascendent într-un cadru geometric și păstrează inițialele simple și lizibile.",
    "يضع هذا الاتجاه مخططًا صاعدًا داخل إطار هندسي، مع إبقاء الأحرف الأولى واضحة وسهلة القراءة."
  ],
  [
    "DIRECTION B / HAND + ECONOMY",
    "DIRECȚIA B / MÂNĂ + ECONOMIE",
    "الاتجاه ب / يد + اقتصاد"
  ],
  [
    "Hand and economy.",
    "Mână și economie.",
    "اليد والاقتصاد."
  ],
  [
    "This more illustrative concept combines a hand with an economy symbol and supporting research icons.",
    "Acest concept ilustrativ combină o mână, un simbol economic și pictograme asociate cercetării.",
    "يجمع هذا التصور التوضيحي بين اليد ورمز للاقتصاد وأيقونات مساندة للأبحاث."
  ],
  [
    "03 / VISUAL THEME",
    "03 / TEMĂ VIZUALĂ",
    "03 / الطابع البصري"
  ],
  [
    "Colour and",
    "Culoare și",
    "الألوان"
  ],
  [
    "backgrounds.",
    "fundaluri.",
    "والخلفيات."
  ],
  [
    "Teal anchors the identity, with pink and coral for contrast. Light and dark logo versions keep the mark clear across the background colours and surfaces used for the lab.",
    "Turcoazul este culoarea de bază a identității, cu accente roz și coral pentru contrast. Versiunile deschise și închise ale logo-ului păstrează simbolul clar pe fundalurile folosite de laborator.",
    "يشكل التركواز أساس الهوية، مع الوردي والمرجاني لإضافة التباين. وتحافظ نسخ الشعار الفاتحة والداكنة على وضوحه فوق خلفيات المختبر المختلفة."
  ],
  [
    "COLOUR MARK / LIGHT SURFACE",
    "LOGO COLOR / FUNDAL DESCHIS",
    "الشعار الملون / خلفية فاتحة"
  ],
  [
    "COLOUR MARK / DARK SURFACE",
    "LOGO COLOR / FUNDAL ÎNCHIS",
    "الشعار الملون / خلفية داكنة"
  ],
  [
    "DESIGN PRINCIPLE",
    "PRINCIPIU DE DESIGN",
    "مبدأ التصميم"
  ],
  [
    "Keep the core mark consistent, then switch between colour and reversed versions to protect contrast and readability.",
    "Păstrez simbolul de bază consecvent și folosesc versiunea color sau inversată pentru a menține contrastul și lizibilitatea.",
    "أحافظ على ثبات العلامة الأساسية، وأبدل بين النسخة الملونة والمعكوسة للحفاظ على التباين وسهولة القراءة."
  ],
  [
    "04 / TYPE HIERARCHY",
    "04 / IERARHIE TIPOGRAFICĂ",
    "04 / التسلسل الطباعي"
  ],
  [
    "One typeface.",
    "Un singur font.",
    "خط واحد."
  ],
  [
    "Clear levels.",
    "Ierarhie clară.",
    "مستويات واضحة."
  ],
  [
    "I chose Alexandria for a clean, contemporary feel, then set a size and weight for each level so headings, navigation and detail text are easy to tell apart.",
    "Am ales Alexandria pentru aspectul său curat și contemporan, apoi am stabilit dimensiuni și greutăți diferite, pentru a distinge ușor titlurile, navigarea și detaliile.",
    "اخترت خط Alexandria لمظهره العصري والواضح، ثم حددت أحجامًا وسماكات مختلفة لتسهيل تمييز العناوين والتنقل والنصوص التفصيلية."
  ],
  [
    "TYPE SCALE / LIGHT VERSION",
    "SCALĂ TIPOGRAFICĂ / VERSIUNE DESCHISĂ",
    "المقياس الطباعي / النسخة الفاتحة"
  ],
  [
    "TYPE SCALE / DARK VERSION",
    "SCALĂ TIPOGRAFICĂ / VERSIUNE ÎNCHISĂ",
    "المقياس الطباعي / النسخة الداكنة"
  ],
  [
    "05 / LOGO ANIMATION",
    "05 / ANIMAȚIA LOGO-ULUI",
    "05 / تحريك الشعار"
  ],
  [
    "Logo motion and",
    "Animația logo-ului și",
    "حركة الشعار"
  ],
  [
    "branded backgrounds.",
    "fundaluri de brand.",
    "وخلفيات الهوية."
  ],
  [
    "I created an animation for the IDRL logo using the colours and background style developed for the identity. Play it here, or download the video exports and the After Effects project.",
    "Am creat o animație pentru logo-ul IDRL, folosind culorile și stilul de fundal dezvoltate pentru identitate. O poți reda aici sau poți descărca exporturile video și proiectul After Effects.",
    "أنشأت حركة لشعار IDRL باستخدام ألوان الهوية وأسلوب الخلفيات الذي طورته لها. شاهدها هنا، أو نزّل ملفات الفيديو ومشروع After Effects."
  ],
  [
    "ANIMATION PREVIEW",
    "PREVIZUALIZARE ANIMAȚIE",
    "معاينة التحريك"
  ],
  [
    "The animation,",
    "Animația,",
    "التحريك"
  ],
  [
    "shown in context.",
    "în context.",
    "ضمن سياقه."
  ],
  [
    "The logo animation can be played here as an MP4 preview.",
    "Animația logo-ului poate fi redată aici ca previzualizare MP4.",
    "يمكن تشغيل حركة الشعار هنا كمعاينة بصيغة MP4."
  ],
  [
    "06 / RECOGNITION",
    "06 / RECUNOAȘTERE",
    "06 / التقدير"
  ],
  [
    "I designed this certificate.",
    "Am creat acest certificat.",
    "صممت هذه الشهادة."
  ],
  [
    "The internship certificate recognizes my contribution to the lab across brand identity, UX/UI, front-end development, and ongoing site maintenance.",
    "Certificatul de practică recunoaște contribuția mea la laborator: identitatea de brand, UX/UI, dezvoltarea front-end și întreținerea continuă a site-ului.",
    "تُقدّر شهادة التدريب مساهمتي في المختبر في الهوية البصرية وUX/UI وتطوير الواجهة الأمامية وصيانة الموقع باستمرار."
  ],
  [
    "OPEN CERTIFICATE ↗",
    "DESCHIDE CERTIFICATUL ↗",
    "افتح الشهادة ↗"
  ],
  [
    "Design, development, and care.",
    "Design, dezvoltare și mentenanță.",
    "التصميم والتطوير والمتابعة."
  ],
  [
    "The certificate recognizes my work on the visual identity and website, along with ongoing support for the lab’s site.",
    "Certificatul recunoaște munca mea la identitatea vizuală și la site, precum și sprijinul continuu acordat site-ului laboratorului.",
    "تُقدّر الشهادة عملي على الهوية البصرية والموقع، إلى جانب دعمي المستمر لموقع المختبر."
  ],
  [
    "VIEW FULL CERTIFICATE ↗",
    "VEZI CERTIFICATUL COMPLET ↗",
    "شاهد الشهادة كاملة ↗"
  ],
  [
    "BACK TO DESIGN ↑",
    "ÎNAPOI LA DESIGN ↑",
    "العودة إلى التصميم ↑"
  ],
  [
    "BACK TO SELECTED DESIGN WORK ↖",
    "ÎNAPOI LA LUCRĂRILE DE DESIGN SELECTATE ↖",
    "العودة إلى أعمال التصميم المختارة ↖"
  ]
];
  idrlTranslations.forEach((entry) => add(entry[0], entry[1], entry[2]));

  const idrlLabelTranslations = [
  [
    "IN THIS PROJECT",
    "ÎN ACEST PROIECT",
    "في هذا المشروع"
  ],
  [
    "Exploration boards · Illustrator files",
    "Planșe de explorare · fișiere Illustrator",
    "لوحات استكشاف · ملفات Illustrator"
  ],
  [
    "OFFICIAL WORK / WEBSITE DESIGN + VISUAL IDENTITY",
    "LUCRĂRI OFICIALE / DESIGN WEB + IDENTITATE VIZUALĂ",
    "أعمال رسمية / تصميم موقع + هوية بصرية"
  ],
  [
    "This case study presents selected work while the full editable project files remain private.",
    "Acest studiu de caz prezintă o selecție de lucrări; fișierele complete, editabile, rămân private.",
    "يعرض هذا المشروع نماذج مختارة من العمل، بينما تظل الملفات الكاملة القابلة للتحرير خاصة."
  ],
  [
    "PRESS PLAY TO VIEW THE LOGO ANIMATION",
    "APASĂ REDAREA PENTRU A VEDEA ANIMAȚIA LOGO-ULUI",
    "اضغط تشغيل لمشاهدة حركة الشعار"
  ],
  [
    "MP4 · INLINE PLAYBACK",
    "MP4 · REDARE ÎN PAGINĂ",
    "MP4 · تشغيل داخل الصفحة"
  ],
  [
    "RESEARCH TEAL",
    "TURCOAZ PENTRU CERCETARE",
    "تركواز الأبحاث"
  ],
  [
    "ACCENT PINK",
    "ACCENT ROZ",
    "وردي بارز"
  ],
  [
    "HIGHLIGHT CORAL",
    "ACCENT CORAI",
    "مرجاني بارز"
  ],
  [
    "LIGHT VERSION",
    "VERSIUNE DESCHISĂ",
    "نسخة فاتحة"
  ],
  [
    "H1 / MAIN TITLE",
    "H1 / TITLU PRINCIPAL",
    "H1 / العنوان الرئيسي"
  ],
  [
    "H2 / SUBTITLE",
    "H2 / SUBTITLU",
    "H2 / العنوان الفرعي"
  ],
  [
    "H3 / SUBHEADING",
    "H3 / SUBTITLU DE SECȚIUNE",
    "H3 / عنوان فرعي"
  ],
  [
    "H4 / SECTION",
    "H4 / SECȚIUNE",
    "H4 / قسم"
  ],
  [
    "BODY TEXT",
    "TEXT PRINCIPAL",
    "النص الأساسي"
  ],
  [
    "NAVIGATION",
    "NAVIGARE",
    "التنقل"
  ],
  [
    "CAPTIONS / SMALL TEXT",
    "LEGENDĂ / TEXT MIC",
    "التعليقات / نص صغير"
  ],
  [
    "IDRL / BRAND & DIGITAL IDENTITY",
    "IDRL / IDENTITATE ȘI DESIGN DIGITAL",
    "IDRL / الهوية والعلامة الرقمية"
  ]
];
  idrlLabelTranslations.forEach((entry) => add(entry[0], entry[1], entry[2]));

  const interfaceTranslations = [
  [
    "WEB",
    "WEB",
    "الويب"
  ],
  [
    "APP",
    "APLICAȚIE",
    "تطبيق"
  ],
  [
    "IDENTITY",
    "IDENTITATE",
    "هوية"
  ],
  [
    "IDENTITY SYSTEM",
    "SISTEM DE IDENTITATE",
    "نظام الهوية"
  ],
  [
    "SYSTEM",
    "SISTEM",
    "النظام"
  ],
  [
    "MOTION",
    "MIȘCARE",
    "حركة"
  ],
  [
    "WEBSITE",
    "SITE WEB",
    "موقع إلكتروني"
  ],
  [
    "WEBSITE + IDENTITY",
    "SITE + IDENTITATE",
    "موقع + هوية"
  ],
  [
    "WEBSITE DESIGN / FIGMA",
    "DESIGN WEB / FIGMA",
    "تصميم الموقع / FIGMA"
  ],
  [
    "TYPE",
    "TIPOGRAFIE",
    "الخطوط"
  ],
  [
    "LOGOS",
    "LOGOURI",
    "الشعارات"
  ],
  [
    "VISIT INFORMALITY.RO",
    "VIZITEAZĂ INFORMALITY.RO",
    "زُر INFORMALITY.RO"
  ],
  [
    "NOOR’S INFORMALITY PROFILE",
    "PROFILUL LUI NOOR LA INFORMALITY",
    "ملف نور على Informality"
  ],
  [
    "ILLUSTRATOR FILE",
    "FIȘIER ILLUSTRATOR",
    "ملف Illustrator"
  ],
  [
    "Explore the IDRL identity case study",
    "Explorează studiul de caz al identității IDRL",
    "استكشف دراسة حالة هوية IDRL"
  ],
  [
    "Explore the IDRL website and visual identity case study",
    "Explorează studiul de caz al site-ului și identității vizuale IDRL",
    "استكشف دراسة حالة موقع IDRL وهويته البصرية"
  ],
  [
    "Open the original UMME fashion wordmark and monogram study in a new tab",
    "Deschide studiul original UMME cu wordmark și monogramă într-o filă nouă",
    "افتح دراسة شعار UMME النصي وعلامته المختصرة في نافذة جديدة"
  ],
  [
    "Open the INCSMPS website design case study",
    "Deschide studiul de caz al designului site-ului INCSMPS",
    "افتح دراسة حالة تصميم موقع INCSMPS"
  ],
  [
    "Explore the IDRL website and visual identity case study",
    "Explorează studiul de caz al site-ului și identității vizuale IDRL",
    "استكشف دراسة حالة موقع IDRL وهويته البصرية"
  ],
  [
    "INFORMALITY.RO",
    "INFORMALITY.RO",
    "INFORMALITY.RO"
  ],
  [
    "TYPE / IDENTITY / MOTION",
    "TIPOGRAFIE / IDENTITATE / MIȘCARE",
    "خطوط / هوية / حركة"
  ],
  [
    "WEBSITE / IDENTITY / TYPE / MOTION",
    "SITE / IDENTITATE / TIPOGRAFIE / MIȘCARE",
    "موقع / هوية / خطوط / حركة"
  ]
];
  interfaceTranslations.forEach((entry) => add(entry[0], entry[1], entry[2]));
  ["SOURCE-BASED DESIGN RECORD","DOSAR DE DESIGN BAZAT PE SURSĂ","سجل تصميم مستند إلى المصدر"],
  ["The actual Figma","Artboardurile reale din Figma","إطارات Figma الفعلية"],
  ["artboards and palette.","și paleta de culori.","ولوحة الألوان."],
  ["The values shown here come from the project’s real frames and color selections. The editable working file is kept private.","Valorile provin din cadrele și selecțiile reale de culori ale proiectului. Fișierul editabil de lucru rămâne privat.","القيم مأخوذة من الإطارات واختيارات الألوان الفعلية في المشروع. يظل ملف العمل القابل للتحرير خاصًا."],
  ["A COMPLETE MULTI-PAGE WEBSITE DESIGN","UN DESIGN COMPLET DE SITE CU MAI MULTE PAGINI","تصميم موقع كامل متعدد الصفحات"],
  ["I designed the complete INCSMPS website as a connected set of desktop and mobile pages. This case study records the actual frame names, dimensions, and colors from my Figma work.","Am proiectat întregul site INCSMPS ca un set coerent de pagini desktop și mobile. Acest studiu de caz consemnează numele, dimensiunile și culorile reale ale cadrelor din proiectul meu Figma.","صممت موقع INCSMPS بالكامل كمجموعة مترابطة من صفحات سطح المكتب والهاتف. توثق دراسة الحالة أسماء الإطارات وأبعادها وألوانها الفعلية من عملي على Figma."],
  ["Complete website design","Design complet de site","تصميم الموقع بالكامل"],
  ["Design nearly complete · not launched","Design aproape finalizat · nelansat","التصميم شبه مكتمل · لم يُطلق بعد"],
  ["02 / ARTBOARD INDEX","02 / INDEXUL CADRELOR","02 / فهرس الإطارات"],
  ["Seven page frames.","Șapte cadre de pagină.","سبعة إطارات للصفحات."],
  ["One complete site.","Un site complet.","موقع متكامل."],
  ["These are the page names used in the original Figma file. Six desktop and mobile pairs have verified dimensions; the Contact Us frame is also present in the source.","Acestea sunt numele paginilor din fișierul Figma original. Șase perechi desktop și mobile au dimensiuni verificate; cadrul Contact Us este prezent și el în sursă.","هذه أسماء الصفحات في ملف Figma الأصلي. تم التحقق من أبعاد ستة أزواج لسطح المكتب والهاتف؛ كما يظهر إطار Contact Us في المصدر."],
  ["07 / CONTACT","07 / CONTACT","07 / التواصل"],
  ["Separate page frame in the source file.","Cadru separat de pagină în fișierul sursă.","إطار صفحة منفصل في الملف الأصلي."],
  ["03 / SOURCE PALETTE","03 / PALETA DIN SURSĂ","03 / لوحة ألوان المصدر"],
  ["The colours","Culorile","الألوان"],
  ["from the file.","din fișier.","من الملف."],
  ["These values were read from the Figma selection colors in the original design. They are shown as source swatches, not as colors guessed from a recreated interface.","Aceste valori au fost citite din culorile selectate în Figma pentru designul original. Sunt mostre reale din sursă, nu nuanțe ghicite dintr-o interfață recreată.","قُرئت هذه القيم من ألوان التحديد في تصميم Figma الأصلي. تُعرض كعينات من المصدر وليست ألوانًا مخمّنة من واجهة معاد تصميمها."],
  ["INCSMPS · FIGMA COLOR SELECTIONS","INCSMPS · CULORI SELECTATE ÎN FIGMA","INCSMPS · ألوان محددة في FIGMA"],
  ["13 VISIBLE VALUES","13 VALORI VIZIBILE","13 قيمة ظاهرة"],
  ["04 / RESPONSIVE FRAME SIZES","04 / DIMENSIUNILE CADRELOR RESPONSIVE","04 / أبعاد إطارات التصميم المتجاوب"],
  ["Desktop and mobile,","Desktop și mobil,","سطح المكتب والهاتف،"],
  ["in the source file.","în fișierul sursă.","في الملف الأصلي."],
  ["The dimensions below match the measured Figma frames. They show the scale of the six paired page designs; Contact Us is listed separately because its dimensions were not recorded here.","Dimensiunile corespund cadrelor măsurate în Figma. Ele arată scara celor șase perechi de pagini; Contact Us este listat separat, deoarece dimensiunile sale nu au fost înregistrate.","تطابق الأبعاد إطارات Figma المقاسة، وتوضح حجم تصميمات الصفحات الست المتزاوجة؛ أما Contact Us فمذكور منفصلًا لأن أبعاده لم تُسجل."],
  ["FIGMA PAGE","PAGINĂ FIGMA","صفحة FIGMA"],
  ["DESKTOP FRAME","CADRU DESKTOP","إطار سطح المكتب"],
  ["MOBILE FRAME","CADRU MOBIL","إطار الهاتف"],
  ["ALSO IN THE SOURCE","PREZENT ȘI ÎN SURSĂ","موجود أيضًا في المصدر"],
  ["The frame is present in Figma; its dimensions have not been included in this measurement set.","Cadrul este prezent în Figma; dimensiunile sale nu sunt incluse în acest set de măsurători.","الإطار موجود في Figma، ولم تُدرج أبعاده في مجموعة القياسات هذه."],
  ["A complete website design,","Un design complet de site,","تصميم موقع كامل،"],
  ["ready for its next chapter.","pregătit pentru următorul capitol.","جاهز لمرحلته التالية."],
  ["The INCSMPS design is close to complete, but the website has not been launched. This case study shares verified information from the original Figma work while the full editable design file stays private.","Designul INCSMPS este aproape finalizat, dar site-ul nu a fost lansat. Acest studiu de caz prezintă informații verificate din proiectul Figma original, iar fișierul complet, editabil, rămâne privat.","تصميم INCSMPS قريب من الاكتمال، لكن الموقع لم يُطلق. تعرض دراسة الحالة معلومات مؤكدة من عمل Figma الأصلي، بينما يظل ملف التصميم الكامل القابل للتحرير خاصًا."],
  ["ACTUAL FIGMA FRAME INDEX","INDEXUL REAL AL CADRELOR FIGMA","فهرس إطارات FIGMA الفعلية"],
  ["7 page frames","7 cadre de pagină","7 إطارات للصفحات"],
  ["6 desktop + mobile pairs","6 perechi desktop + mobile","6 أزواج سطح مكتب + هاتف"],
  ["ACASA","ACASA","ACASA"],
  ["MOBILE","MOBIL","الهاتف"],
  ["OFFICIAL PROJECT / WEBSITE + IDENTITY","PROIECT OFICIAL / SITE + IDENTITATE","مشروع رسمي / موقع + هوية"],
  ["I designed the complete IDRL website as well as its visual identity, bringing the lab’s research into one clear digital experience.","Am proiectat întregul site IDRL, precum și identitatea sa vizuală, aducând cercetarea laboratorului într-o experiență digitală clară.","صممت موقع IDRL بالكامل وهويته البصرية، وجمعت أبحاث المختبر في تجربة رقمية واضحة."],
  ["EXPLORE IDRL WEBSITE + IDENTITY","EXPLOREAZĂ SITE-UL ȘI IDENTITATEA IDRL","استكشف موقع IDRL وهويته"],
  ["OFFICIAL WORK · WEBSITE + IDENTITY","LUCRĂRI OFICIALE · SITE + IDENTITATE","أعمال رسمية · موقع + هوية"],
  ["WEBSITE · IDENTITY · MOTION","SITE · IDENTITATE · ANIMAȚIE","الموقع · الهوية · الحركة"],
  ["A research website","Un site de cercetare","موقع للأبحاث"],
  ["EXPLORE THE PROJECT","EXPLOREAZĂ PROIECTUL","استكشف المشروع"],
  ["WEBSITE / IDENTITY / TYPE / MOTION","SITE / IDENTITATE / TIPOGRAFIE / ANIMAȚIE","الموقع / الهوية / الخط / الحركة"],
  ["IDRL website and visual identity case study","Studiu de caz: site-ul și identitatea vizuală IDRL","دراسة حالة موقع IDRL وهويته البصرية"],
  ["WEBSITE DESIGN","DESIGN DE SITE","تصميم الموقع"],
  ["The complete website,","Întregul site,","الموقع الكامل،"],
  ["designed as one system.","proiectat ca un sistem unitar.","مصمم كنظام واحد."],
  ["I designed the full IDRL website alongside its visual identity. The website brings the lab’s research into a clear, connected digital experience.","Am proiectat întregul site IDRL împreună cu identitatea sa vizuală. Site-ul prezintă cercetarea laboratorului într-o experiență digitală clară și coerentă.","صممت موقع IDRL بالكامل إلى جانب هويته البصرية، ويعرض الموقع أبحاث المختبر ضمن تجربة رقمية واضحة ومترابطة."],
  ["OFFICIAL WORK / WEBSITE DESIGN + VISUAL IDENTITY","LUCRARE OFICIALĂ / DESIGN DE SITE + IDENTITATE VIZUALĂ","عمل رسمي / تصميم الموقع + الهوية البصرية"],
  ["This case study presents selected work while the full editable project files remain private.","Acest studiu de caz prezintă lucrări selectate; fișierele complete editabile rămân private.","تعرض دراسة الحالة أعمالًا مختارة بينما تظل ملفات المشروع الكاملة القابلة للتحرير خاصة."],
  ["VISIT THE IDRL WEBSITE","VIZITEAZĂ SITE-UL IDRL","زُر موقع IDRL"],
  ["ANIMATION PREVIEW","PREVIZUALIZARE ANIMAȚIE","معاينة الحركة"],
  ["The animation,","Animația,","الحركة،"],
  ["shown in context.","prezentată în context.","معروضة ضمن سياقها."],
  ["The logo animation can be played here as an MP4 preview.","Animația logo-ului poate fi redată aici ca previzualizare MP4.","يمكن تشغيل حركة الشعار هنا كمعاينة MP4."].forEach((entry) => add(entry[0], entry[1], entry[2]));

  add("LANGUAGES", "LIMBI", "اللغات");
  add("ENGLISH", "ENGLEZĂ", "الإنجليزية");
  add("IDEA", "IDEE", "الفكرة");
  add("COLOR / TYPE / DETAIL", "CULOARE / TIPOGRAFIE / DETALIU", "لون / خط / تفاصيل");
  add("01 / COLOR", "01 / CULOARE", "01 / اللون");
  add("02 / TYPE", "02 / TIPOGRAFIE", "02 / الخط");
  add("03 / DETAIL", "03 / DETALIU", "03 / التفاصيل");
  add("INK", "CERNEALĂ", "حبر");
  add("PAPER", "HÂRTIE", "ورق");
  add("WINE", "VIȘINIU", "عنابي");
  add("TEAL", "TURCOAZ", "تركواز");
  add("WEB", "WEB", "الويب");
  add("PERSONAL", "PERSONAL", "شخصي");
  add("DEVELOPMENT", "DEZVOLTARE", "تطوير");
  add("DESIGN", "DESIGN", "تصميم");
  add("CODE", "COD", "برمجة");
  add("RESEARCH", "CERCETARE", "أبحاث");
  add("01 / HOME", "01 / ACASĂ", "01 / الرئيسية");
  add("02 / DESIGN", "02 / DESIGN", "02 / التصميم");
  add("03 / RESEARCH", "03 / CERCETARE", "03 / الأبحاث");
  add("04 / PIANO", "04 / PIAN", "04 / البيانو");
  add("05 / PHOTOGRAPHY", "05 / FOTOGRAFIE", "05 / التصوير");
  add("PERSONAL SITE / DESIGN / DEVELOPMENT", "SITE PERSONAL / DESIGN / DEZVOLTARE", "موقع شخصي / تصميم / تطوير");
  add("IDEA / IDENTITY / EXPERIENCE", "IDEE / IDENTITATE / EXPERIENȚĂ", "فكرة / هوية / تجربة");
  add("PERSONAL PROJECT · DESIGN · CODE", "PROIECT PERSONAL · DESIGN · COD", "مشروع شخصي · تصميم · برمجة");
  add("COLOR / TYPE / DETAIL", "CULOARE / TIPOGRAFIE / DETALIU", "لون / خط / تفاصيل");
  add("ROBOTO SLAB", "ROBOTO SLAB", "ROBOTO SLAB");
  add("Barlow Condensed", "Barlow Condensed", "Barlow Condensed");
  add("IBM Plex Mono", "IBM Plex Mono", "IBM Plex Mono");
  add("Photographs", "Fotografii", "صور");
  add("WEB DEVELOPER", "DEZVOLTATOR WEB", "مطور ويب");
  add("AND RESEARCHER", "ȘI CERCETĂTOR", "وباحث");
  add("DESIGN / WORK", "DESIGN / LUCRĂRI", "تصميم / أعمال");
  add("STATISTICS / RESEARCH", "STATISTICĂ / CERCETARE", "إحصاء / أبحاث");
  add("Web · Apps", "Web · Aplicații", "الويب · التطبيقات");
  add("· Software · Logos", "· Software · Logouri", "· البرمجيات · الشعارات");
  add("Statistics", "Statistică", "الإحصاء");
  add("and economy", "și economie", "والاقتصاد");
  add("Arabic · English", "Arabă · Engleză", "العربية · الإنجليزية");
  add("Romanian", "Română", "الرومانية");
  add("I’m fluent in Arabic, English and Romanian. I’m also an entrepreneur and manage my retail store in", "Vorbesc fluent araba, engleza și româna. Sunt și antreprenor și administrez magazinul meu din", "أتحدث العربية والإنجليزية والرومانية بطلاقة. وأنا رائد أعمال أدير متجري في");
  add("02 / SELECTED WORK", "02 / LUCRĂRI SELECTATE", "02 / أعمال مختارة");
  add("DESIGN · DEVELOPMENT · RESEARCH", "DESIGN · DEZVOLTARE · CERCETARE", "تصميم · تطوير · أبحاث");
  add("WEBSITE", "SITE WEB", "موقع إلكتروني");
  add("+ IDENTITY", "+ IDENTITATE", "+ هوية");
  add("01 — WEB DESIGN / IDENTITY", "01 — DESIGN WEB / IDENTITATE", "01 — تصميم ويب / هوية");
  add("VIEW NOOR’S PROFILE AT INFORMALITY", "VEZI PROFILUL LUI NOOR LA INFORMALITY", "شاهد ملف نور على Informality");
  add("VIEW IDRL IDENTITY DESIGN", "VEZI IDENTITATEA VIZUALĂ IDRL", "شاهد هوية IDRL البصرية");
  add("DATA", "DATE", "بيانات");
  add("CORRUPTION", "CORUPȚIE", "فساد");
  add("PROTEST", "PROTEST", "احتجاج");
  add("MIGRATION", "MIGRAȚIE", "هجرة");
  add("02 — ECONOMICS / STATISTICS", "02 — ECONOMIE / STATISTICĂ", "02 — اقتصاد / إحصاء");
  add("EXPLORE RESEARCH", "EXPLOREAZĂ CERCETAREA", "استكشف الأبحاث");
  add("WEB", "WEB", "الويب");
  add("APP", "APLICAȚIE", "تطبيق");
  add("MOTION", "MIȘCARE", "حركة");
  add("03 — DESIGN / DIGITAL CRAFT", "03 — DESIGN / CREAȚIE DIGITALĂ", "03 — تصميم / إبداع رقمي");
  add("WEB · APP · LOGO", "WEB · APLICAȚIE · LOGO", "ويب · تطبيق · شعار");
  add("03 / OFF THE CLOCK", "03 / ÎN AFARA MUNCII", "03 / خارج أوقات العمل");
  add("MUSIC · PHOTOGRAPHY", "MUZICĂ · FOTOGRAFIE", "موسيقى · تصوير");
  add("01 / MUSIC", "01 / MUZICĂ", "01 / الموسيقى");
  add("LISTEN TO MORE", "ASCULTĂ MAI MULT", "استمع إلى المزيد");
  add("VIEW & ADMIRE", "PRIVEȘTE ȘI ADMIRĂ", "شاهد وتأمل");
  add("02 / PHOTOGRAPHY", "02 / FOTOGRAFIE", "02 / التصوير");
  add("ENJOY & LISTEN", "BUCURĂ-TE ȘI ASCULTĂ", "استمتع واستمع");
  add("ALSO ON NOOR’S MIND", "ȘI ÎN GÂNDURILE LUI NOOR", "أيضًا في بال نور");
  add("04 / CONTACT", "04 / CONTACT", "04 / التواصل");
  add("Scroll to explore Noor’s profile", "Derulează pentru a descoperi profilul lui Noor", "مرر لاستكشاف ملف نور");
  add("Explore Noor’s work and interests", "Explorează lucrările și interesele lui Noor", "استكشف أعمال نور واهتماماته");
  add("Explore Noor’s research projects, data, and presentations in economics and statistics", "Explorează proiectele de cercetare, datele și prezentările lui Noor despre economie și statistică", "استكشف أبحاث نور وبياناته وعروضه في الاقتصاد والإحصاء");
  add("Explore Noor’s design workshop, including websites, interfaces, logos, animation, and experiments", "Explorează atelierul de design al lui Noor: site-uri, interfețe, logo-uri, animații și experimente", "استكشف ورشة تصميم نور، بما فيها المواقع والواجهات والشعارات والرسوم المتحركة والتجارب");
  add("01 / SELECTED PROJECT", "01 / PROIECT SELECTAT", "01 / مشروع مختار");
  add("OFFICIAL WORK · VISUAL IDENTITY", "LUCRĂRI OFICIALE · IDENTITATE VIZUALĂ", "أعمال رسمية · هوية بصرية");
  add("SELECTED PROJECT", "PROIECT SELECTAT", "مشروع مختار");
  add("OFFICIAL WORK / IDRL", "LUCRĂRI OFICIALE / IDRL", "أعمال رسمية / IDRL");
  add("02 / PERSONAL WORK", "02 / LUCRĂRI PERSONALE", "02 / أعمال شخصية");
  add("INDEPENDENT PROJECTS · MADE BY NOOR", "PROIECTE INDEPENDENTE · CREATE DE NOOR", "مشاريع مستقلة · من صنع نور");
  add("I design and build websites, apps, and visual identities.", "Creez site-uri, aplicații și identități vizuale.", "أصمم وأبني المواقع والتطبيقات والهويات البصرية.");
  add("EXPLORE THE SITE", "EXPLOREAZĂ SITE-UL", "استكشف الموقع");
  add("PERSONAL PROJECT / 2026", "PROIECT PERSONAL / 2026", "مشروع شخصي / 2026");
  add("PERSONAL STUDY / FASHION WORDMARK", "STUDIU PERSONAL / WORDMARK DE MODĂ", "دراسة شخصية / شعار نصي للأزياء");
  add("PERSONAL STUDY / 01", "STUDIU PERSONAL / 01", "دراسة شخصية / 01");
  add("03 / OFFICIAL WORK", "03 / LUCRĂRI OFICIALE", "03 / أعمال رسمية");
  add("OFFICIAL COLLABORATION / IDRL", "COLABORARE OFICIALĂ / IDRL", "تعاون رسمي / IDRL");
  add("Designing for a", "Design pentru un", "تصميم من أجل");
  add("research lab.", "laborator de cercetare.", "مختبر أبحاث.");
  add("Professional work for Informality Data Research Lab, including its website and visual identity.", "Lucrare profesională pentru Informality Data Research Lab, inclusiv site-ul și identitatea sa vizuală.", "عمل احترافي لمختبر أبحاث بيانات الاقتصاد غير الرسمي، يشمل موقعه وهويته البصرية.");
  add("DESIGN + IDENTITY", "DESIGN + IDENTITATE", "تصميم + هوية");
  add("OFFICIAL PROJECT / WEB + IDENTITY", "PROIECT OFICIAL / WEB + IDENTITATE", "مشروع رسمي / ويب + هوية");
  add("A visual identity built to give the lab a clear, recognizable presence across its website and research work.", "O identitate vizuală care oferă laboratorului o prezență clară și recognoscibilă pe site și în cercetările sale.", "هوية بصرية تمنح المختبر حضورًا واضحًا يسهل تمييزه عبر موقعه وأعماله البحثية.");
  add("A regional study of socioeconomic measures and recorded theft-related crime across Europe’s NUTS 2 regions, using Eurostat indicators and spatial analysis.", "Un studiu regional al indicatorilor socioeconomici și al infracțiunilor de furt în regiunile NUTS 2 din Europa, folosind indicatori Eurostat și analiză spațială.", "دراسة إقليمية للمؤشرات الاجتماعية والاقتصادية والجرائم المرتبطة بالسرقة في أقاليم NUTS 2 الأوروبية، باستخدام مؤشرات Eurostat والتحليل المكاني.");
  add("An exploratory country-level study of corruption perceptions, protest events, and emigration, with a report, descriptive analysis, and regression models.", "Un studiu exploratoriu la nivel de țară despre percepțiile privind corupția, proteste și emigrație, cu raport, analiză descriptivă și modele de regresie.", "دراسة استكشافية على مستوى البلدان لتصورات الفساد وأحداث الاحتجاج والهجرة، تتضمن تقريرًا وتحليلًا وصفيًا ونماذج انحدار.");
  add("A 2023-context marketing study of Romania’s electric-vehicle market, with a Tesla SWOT and recommendations across the marketing mix.", "Un studiu de marketing în contextul anului 2023 despre piața vehiculelor electrice din România, cu analiză SWOT pentru Tesla și recomandări pentru mixul de marketing.", "دراسة تسويقية في سياق عام 2023 لسوق السيارات الكهربائية في رومانيا، تتضمن تحليل SWOT لشركة Tesla وتوصيات للمزيج التسويقي.");
  add("A team presentation on Iraq’s economic structure, employment, currency and proposed routes toward diversification.", "O prezentare de echipă despre structura economică a Irakului, ocuparea forței de muncă, moneda și posibile căi de diversificare.", "عرض جماعي عن الهيكل الاقتصادي للعراق والتوظيف والعملة والمسارات المقترحة نحو التنويع.");
  add("A descriptive look at the ILO modelled share of employed women and men in vulnerable employment. Includes the full annual series, a PowerPoint, and a note on what the indicator can and cannot show.", "O analiză descriptivă a ponderii estimate de OIM a femeilor și bărbaților angajați în condiții vulnerabile. Include seria anuală completă, o prezentare PowerPoint și o notă despre limitele indicatorului.", "نظرة وصفية إلى حصة النساء والرجال العاملين في ظروف هشّة وفق تقديرات منظمة العمل الدولية. تشمل السلسلة السنوية كاملة وعرض PowerPoint وملاحظة حول ما يمكن للمؤشر إظهاره وما لا يمكنه.");
  add("A case study of the IDRL identity, WordPress website work and a 19-day internship workbook, with the report and workbook in DOCX and PDF.", "Un studiu de caz despre identitatea IDRL, lucrul la site-ul WordPress și caietul de practică de 19 zile, cu raport și caiet în DOCX și PDF.", "دراسة حالة لهوية IDRL والعمل على موقع WordPress ودفتر تدريب لمدة 19 يومًا، مع التقرير والدفتر بصيغتي DOCX وPDF.");
  add("Managing Immigration Papers", "Gestionarea documentelor de imigrare", "إدارة أوراق الهجرة");
  add("An earlier coursework database prototype for organizing clients, applications, services, documents, employees, appointments and reference countries.", "Un prototip de bază de date realizat pentru un curs, destinat organizării clienților, cererilor, serviciilor, documentelor, angajaților, programărilor și țărilor de referință.", "نموذج أولي لقاعدة بيانات ضمن عمل دراسي لتنظيم العملاء والطلبات والخدمات والوثائق والموظفين والمواعيد والبلدان المرجعية.");
  add("Immigration database programming", "Programarea bazei de date pentru imigrare", "برمجة قاعدة بيانات الهجرة");
  add("A separate follow-on report about an expanded Oracle schema, stored routines, triggers, cursors, exception handling and audit logic.", "Un raport ulterior separat despre o schemă Oracle extinsă, rutine stocate, declanșatoare, cursoare, tratarea excepțiilor și logica de audit.", "تقرير لاحق منفصل عن مخطط Oracle موسّع وإجراءات مخزنة ومشغلات ومؤشرات ومعالجة الاستثناءات ومنطق التدقيق.");
  add("FRAME","CADRU","إطار");
  add("01 FRAME · DATE NOT RECORDED","01 CADRU · DATA NU A FOST ÎNREGISTRATĂ","01 إطار · لم يُسجل التاريخ");


  const languageNames = {
    en: "Choose language",
    ro: "Alege limba",
    ar: "اختر اللغة"
  };
  const switcherTitles = {
    en: "Choose language. Some detailed project content is still in English.",
    ro: "Alege limba. Unele detalii din proiecte sunt încă în engleză.",
    ar: "اختر اللغة. لا تزال بعض تفاصيل المشاريع باللغة الإنجليزية."
  };
  const pageMeta = {
    "/": {
      en: ["Al Sammarraie Nooruldeen — Web Design & Development", "Design, development, animation, photography, and interests in statistics and Iraq's shadow economy."],
      ro: ["Al Sammarraie Nooruldeen — Design și dezvoltare web", "Design, dezvoltare, animație, fotografie și interese în statistică și economia ascunsă din Irak."],
      ar: ["Al Sammarraie Nooruldeen — تصميم وتطوير الويب", "تصميم وتطوير ورسوم متحركة وتصوير واهتمامات بالإحصاء والاقتصاد الخفي في العراق."]
    },
    "/design/": {
      en: ["Design & Digital Work — Al Sammarraie Nooruldeen", "Websites, interfaces, visual identity, and animation, including the complete IDRL website and visual identity."],
      ro: ["Design și lucrări digitale — Al Sammarraie Nooruldeen", "Site-uri, interfețe, identitate vizuală și animație, inclusiv site-ul complet și identitatea vizuală IDRL."],
      ar: ["التصميم والأعمال الرقمية — Al Sammarraie Nooruldeen", "مواقع وواجهات وهوية بصرية وحركة، بما في ذلك موقع IDRL الكامل وهويته البصرية."]
    },
    "/research/": {
      en: ["Research & Statistics — Al Sammarraie Nooruldeen", "Research and projects about economics, statistics, data, and social change."],
      ro: ["Cercetare și statistică — Al Sammarraie Nooruldeen", "Cercetări și proiecte despre economie, statistică, date și schimbare socială."],
      ar: ["الأبحاث والإحصاء — Al Sammarraie Nooruldeen", "أبحاث ومشاريع حول الاقتصاد والإحصاء والبيانات والتغيير الاجتماعي."]
    },
    "/piano/": {
      en: ["Piano — Al Sammarraie Nooruldeen", "Piano pieces Noor has learned and ideas he has played for himself."],
      ro: ["Pian — Al Sammarraie Nooruldeen", "Piese de pian învățate de Noor și idei cântate pentru sine."],
      ar: ["البيانو — Al Sammarraie Nooruldeen", "مقطوعات بيانو تعلمها نور وأفكار عزفها لنفسه."]
    },
    "/photos/": {
      en: ["Photography — Al Sammarraie Nooruldeen", "Street scenes, changing light, and small details photographed by Noor."],
      ro: ["Fotografie — Al Sammarraie Nooruldeen", "Scene de stradă, lumină schimbătoare și detalii fotografiate de Noor."],
      ar: ["التصوير — Al Sammarraie Nooruldeen", "مشاهد شوارع وضوء متغير وتفاصيل صغيرة صورها نور."]
    },
    "/idrl/": {
      en: ["IDRL Website & Visual Identity — Al Sammarraie Nooruldeen", "A case study of the complete Informality Data Research Lab website design and visual identity."],
      ro: ["Site-ul și identitatea vizuală IDRL — Al Sammarraie Nooruldeen", "Un studiu de caz despre designul complet al site-ului și identitatea vizuală Informality Data Research Lab."],
      ar: ["موقع IDRL وهويته البصرية — Al Sammarraie Nooruldeen", "دراسة حالة للتصميم الكامل لموقع مختبر أبحاث بيانات الاقتصاد غير الرسمي وهويته البصرية."]
    },
    "/site-story/": {
      en: ["How This Site Came Together — Nooruldeen", "How Nooruldeen.com grew into a personal place for design, development, research, music, and photography."],
      ro: ["Cum a luat formă acest site — Nooruldeen", "Cum a devenit Nooruldeen.com un spațiu personal pentru design, dezvoltare, cercetare, muzică și fotografie."],
      ar: ["كيف تكوّن هذا الموقع — نور الدين", "كيف أصبح Nooruldeen.com مساحة شخصية للتصميم والتطوير والأبحاث والموسيقى والتصوير."]
    },
    "/incsmps/": {
      en: ["INCSMPS Website Design — Al Sammarraie Nooruldeen", "A source-based case study of Nooruldeen’s near-complete INCSMPS website design, including the original page set, frame sizes, and palette."],
      ro: ["Designul site-ului INCSMPS — Al Sammarraie Nooruldeen", "Un studiu de caz bazat pe sursă despre designul aproape finalizat al site-ului INCSMPS, cu paginile originale, dimensiunile cadrelor și paleta."],
      ar: ["تصميم موقع INCSMPS — Al Sammarraie Nooruldeen", "دراسة حالة مستندة إلى المصدر عن تصميم موقع INCSMPS شبه المكتمل، تشمل الصفحات الأصلية وأبعاد الإطارات ولوحة الألوان."]
    }
  };
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let activeLanguage = "en";
  let switcher = null;

  function localizeCase(original, translated, language) {
    if (original === original.toLocaleUpperCase("en")) {
      return translated.toLocaleUpperCase(language === "ar" ? "ar" : "ro");
    }
    if (/^[A-ZĂÂÎȘȚ]/.test(original)) {
      const locale = language === "ar" ? "ar" : "ro";
      return translated.slice(0, 1).toLocaleUpperCase(locale) + translated.slice(1);
    }
    return translated;
  }

  function localizeDate(source, language) {
    const match = source.match(/^([A-Z]+)\\s+(\\d{1,2}),\\s*(\\d{4})$/);
    if (!match || language === "en") return null;
    const months = { JANUARY:0, FEBRUARY:1, MARCH:2, APRIL:3, MAY:4, JUNE:5, JULY:6, AUGUST:7, SEPTEMBER:8, OCTOBER:9, NOVEMBER:10, DECEMBER:11 };
    if (!(match[1] in months)) return null;
    const date = new Date(Date.UTC(Number(match[3]), months[match[1]], Number(match[2])));
    return new Intl.DateTimeFormat(language === "ro" ? "ro-RO" : "ar", { day:"numeric", month:"long", year:"numeric", timeZone:"UTC" }).format(date);
  }

  function localizePhotoLabel(source, language) {
    if (language === "en") return null;
    const captured = source.match(/^CAPTURED IN (\d{4})$/);
    if (captured) return language === "ro" ? "FOTOGRAFIAT ÎN " + captured[1] : "التقطت في " + captured[1];
    const frame = source.match(/^FRAME (.+)$/);
    if (frame) return (language === "ro" ? "CADRU " : "إطار ") + frame[1];
    return null;
  }

  function translateNode(node, language) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
    const source = originalText.get(node);
    if (!source.trim()) return;
    const entry = translations[normalize(source)];
    const localizedDate = language === "en" ? null : localizeDate(source.trim(), language);
    const localizedPhotoLabel = language === "en" ? null : localizePhotoLabel(source.trim(), language);
    if (language === "en" || (!entry && !localizedDate && !localizedPhotoLabel)) {
      node.nodeValue = source;
      return;
    }
    const localized = localizedDate || localizedPhotoLabel || localizeCase(source.trim(), entry?.[language] || source.trim(), language);
    node.nodeValue = source.replace(source.trim(), localized);
  }

  function translateAttribute(element, name, language) {
    if (!element.hasAttribute(name)) return;
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = Object.create(null);
      originalAttributes.set(element, originals);
    }
    if (!(name in originals)) originals[name] = element.getAttribute(name);
    const source = originals[name];
    const entry = translations[normalize(source)];
    element.setAttribute(name, language === "en" || !entry ? source : localizeCase(source, entry[language] || source, language));
  }

  function collectAndTranslate(root, language) {
    if (root.nodeType === Node.TEXT_NODE) {
      translateNode(root, language);
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) translateNode(walker.currentNode, language);
    if (root.querySelectorAll) {
      root.querySelectorAll("[aria-label],[title],[placeholder],[alt]").forEach((element) => {
        ["aria-label", "title", "placeholder", "alt"].forEach((attribute) => translateAttribute(element, attribute, language));
      });
    }
  }

  function translateContextualHeadings(language) {
    const contexts = [
      { selector:"#work-title", text:{ en:["What Noor","works on."], ro:["Ce face Noor","zi de zi."], ar:["ما الذي يفعله","نور؟"] } },
      { selector:"#hobbies-title", text:{ en:["Noor’s","hobbies."], ro:["Pasiunile","lui Noor."], ar:["هوايات","نور."] } },
      { selector:"#piano-room-title", text:{ en:["Noor’s","pieces."], ro:["Piesele","lui Noor."], ar:["مقطوعات","نور."] } },
      { selector:"#photos-page-title", text:{ en:["Noor’s","Photo Gallery"], ro:["Galeria foto","a lui Noor"], ar:["معرض صور","نور"] } },
      { selector:"#story-title", text:{ en:["Built to feel","like","me."], ro:["Creat să","semene","cu mine."], ar:["صُمم ليعبّر","عن","شخصيتي."] } }
    ];
    contexts.forEach((context) => {
      const element = document.querySelector(context.selector);
      if (!element) return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
      }
      const replacements = context.text[language];
      if (nodes.length !== replacements.length) return;
      nodes.forEach((node, index) => {
        if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
        const source = originalText.get(node);
        node.nodeValue = source.replace(source.trim(), replacements[index]);
      });
    });
  }

  function ensureArabicFont() {
    if (document.getElementById("noor-arabic-font")) return;
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect);
    const font = document.createElement("link");
    font.id = "noor-arabic-font";
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
    document.head.appendChild(font);
  }

  function createSwitcher() {
    const header = document.querySelector(".topline");
    if (!header || switcher) return;
    switcher = document.createElement("div");
    switcher.className = "site-language-switcher";
    switcher.setAttribute("role", "group");
    switcher.dataset.noorLanguageSwitcher = "";
    const buttons = [
      ["en", "EN", "English"],
      ["ro", "RO", "Română"],
      ["ar", "عربي", "العربية"]
    ];
    buttons.forEach(([code, label, languageName]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.siteLang = code;
      button.lang = code;
      button.setAttribute("aria-pressed", "false");
      button.title = languageName;
      button.addEventListener("click", () => setLanguage(code, true));
      switcher.appendChild(button);
    });
    const contact = header.querySelector(".topline-contact");
    header.insertBefore(switcher, contact || null);
    updateSwitcher();
  }

  function updateSwitcher() {
    if (!switcher) return;
    switcher.setAttribute("aria-label", languageNames[activeLanguage]);
    switcher.title = switcherTitles[activeLanguage];
    switcher.querySelectorAll("[data-site-lang]").forEach((button) => {
      const selected = button.dataset.siteLang === activeLanguage;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function updatePageMetadata(language) {
    const meta = pageMeta[window.location.pathname.replace(/\/+$/, "/")];
    if (!meta) return;
    document.title = meta[language][0];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = meta[language][1];
  }

  function setLanguage(language, persist) {
    if (!LANGUAGES.includes(language)) return;
    activeLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    if (language === "ar") ensureArabicFont();
    collectAndTranslate(document.body, language);
    translateContextualHeadings(language);
    updatePageMetadata(language);
    updateSwitcher();
    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
    }
  }

  function initialLanguage() {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    if (LANGUAGES.includes(queryLanguage)) return queryLanguage;
    try {
      const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
      if (LANGUAGES.includes(savedLanguage)) return savedLanguage;
    } catch (_) {}
    return "en";
  }

  function observeAddedContent() {
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateNode(node, activeLanguage);
          else if (node.nodeType === Node.ELEMENT_NODE) collectAndTranslate(node, activeLanguage);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    createSwitcher();
    setLanguage(initialLanguage(), false);
    observeAddedContent();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
