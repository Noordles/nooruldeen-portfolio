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
    ["Shifting Shadows","Umbre în schimbare","ظلال متحركة"],
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
    ["MAKE SPACE TO EXPLORE","اترك مجالًا للاستكشاف","اترك مساحة للاستكشاف"],
    ["Let every interest have a clear path.","امنح كل اهتمام مسارًا واضحًا.","امنح كل اهتمام مسارًا واضحًا."],
    ["The side navigation stays familiar as the pages change. Sections, cards, and small labels help people understand where they are and where a link will take them.","يظل التنقل الجانبي مألوفًا مع تغيّر الصفحات. وتساعد الأقسام والبطاقات والتسميات الصغيرة على فهم الموقع الحالي والوجهة التي يقود إليها الرابط.","يبقى التنقل الجانبي مألوفًا مع تغير الصفحات. وتوضح الأقسام والبطاقات والتسميات الصغيرة مكان الزائر والوجهة التي سينقله إليها الرابط."],
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
    ["Three languages","Trei limbi","ثلاث لغات"]
  ];

  entries.forEach((entry) => add(entry[0], entry[1], entry[2]));

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
      en: ["Design & Digital Work — Al Sammarraie Nooruldeen", "Websites, interfaces, visual identity, animation, and independent design projects."],
      ro: ["Design și lucrări digitale — Al Sammarraie Nooruldeen", "Site-uri, interfețe, identitate vizuală, animație și proiecte independente de design."],
      ar: ["التصميم والأعمال الرقمية — Al Sammarraie Nooruldeen", "مواقع وواجهات وهوية بصرية ورسوم متحركة ومشاريع تصميم مستقلة."]
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
      en: ["IDRL Identity Case Study — Al Sammarraie Nooruldeen", "A case study of the identity and website work for Informality Data Research Lab."],
      ro: ["Studiu de caz identitate IDRL — Al Sammarraie Nooruldeen", "Un studiu de caz despre identitatea și site-ul Informality Data Research Lab."],
      ar: ["دراسة حالة هوية IDRL — Al Sammarraie Nooruldeen", "دراسة حالة لهوية وموقع مختبر أبحاث بيانات الاقتصاد غير الرسمي."]
    },
    "/site-story/": {
      en: ["How This Site Came Together — Nooruldeen", "How Nooruldeen.com grew into a personal place for design, development, research, music, and photography."],
      ro: ["Cum a luat formă acest site — Nooruldeen", "Cum a devenit Nooruldeen.com un spațiu personal pentru design, dezvoltare, cercetare, muzică și fotografie."],
      ar: ["كيف تكوّن هذا الموقع — نور الدين", "كيف أصبح Nooruldeen.com مساحة شخصية للتصميم والتطوير والأبحاث والموسيقى والتصوير."]
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

  function translateNode(node, language) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
    const source = originalText.get(node);
    if (!source.trim()) return;
    const entry = translations[normalize(source)];
    const localizedDate = language === "en" ? null : localizeDate(source.trim(), language);
    if (language === "en" || (!entry && !localizedDate)) {
      node.nodeValue = source;
      return;
    }
    const localized = localizedDate || localizeCase(source.trim(), entry[language] || source.trim(), language);
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
