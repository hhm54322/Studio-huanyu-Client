import type { Locale } from './languages'

type Step = readonly [stage: string, title: string, description: string]
type ImplantMediaCopy = {
  steps: readonly Step[]
  controls: readonly [play: string, pause: string, previous: string, next: string, reset: string, completion: string]
  diagram: string
  progress: string
  film: string
  playFilm: string
  transcript: string
  labels: readonly [gap: string, fixture: string, abutment: string, crown: string]
  chapters: readonly string[]
}

export const implantMediaCopy = {
  zh: {
    steps: [
      ['第 0 / 4 步 · 缺牙', '缺了一颗牙。', '缺牙不只是美观问题。缺牙处的牙槽骨会逐渐萎缩，邻牙也可能移位。种植牙替代牙根，让牙槽骨继续承受咬合力。'],
      ['第 1 / 4 步 · 植体', '先放入钛植体。', '局部麻醉下，医生沿 3D 打印导板将钛植体放入颌骨。植体会在接下来的 3–6 个月内与骨组织结合，为长期稳固打下基础。'],
      ['第 2 / 4 步 · 基台', '接上穿过牙龈的连接件。', '植体与骨组织结合后，医生在植体上安装基台。基台穿过牙龈，将植体与可见的牙冠连接起来。'],
      ['第 3 / 4 步 · 牙冠', '戴上看得见的牙。', '根据邻牙的形状、颜色和咬合定制氧化锆牙冠，再将它固定到基台上。'],
      ['完成 · 动画结束', '就像自己的牙一样使用。', '可以正常咀嚼、说话、大笑，晚上无需取下。每天清洁、定期复查有助于长期维护。下一步，了解 All-on-4 / All-on-6 如何重建整排牙。'],
    ],
    controls: ['播放', '暂停', '后退', '下一个', '重播', '动画完成 · 继续看 All-on-4 / 6 如何重建整排牙'],
    diagram: '种植牙部件与安装顺序', progress: '动画进度', film: '种植牙九步视频', playFilm: '播放种植牙视频', transcript: '电影字幕 · 九步，附中文翻译',
    labels: ['缺牙', '植体', '基台', '牙冠'],
    chapters: [
      '咨询与评估——牙齿缺损情况、骨量及您的目标。您的外科医生将评估缺损牙齿、病史以及您希望恢复的功能。',
      '锥形束CT和全景成像——三维骨骼定位、神经位置和鼻窦解剖结构。在进行任何钻孔操作之前，三维扫描可以绘制骨骼高度、神经位置和鼻窦解剖结构图。',
      '数字化治疗方案——装置尺寸、深度和角度均通过虚拟方式设定，而非在治疗椅旁临时设定。',
      '导板及种植体组件——包括种植体、基台和牙冠，均为原装系统。种植体植入骨内，基台穿过牙龈，牙冠或牙桥安装在其上。',
      '引导式种植体植入——采用打印导板，遵循无菌操作规程，在医院级手术室进行操作。打印导板用于控制截骨。',
      '愈合与骨整合——骨骼在 3-6 个月内与钛表面结合；佩戴固定临时修复体。',
      '基台和 ALL-ON-4 / ALL-ON-6——四颗或六颗种植体支撑一个固定的全牙弓；倾斜的后牙种植体避开鼻窦。',
      '最终牙桥交付——氧化锆牙桥已安装完毕，咬合已检查并确认。牙桥已拧紧，并确认其贴合度。',
      '术前术后回顾——术后护理计划、种植体护照和复查时间表将随您带回家。',
    ],
  },
  en: {
    steps: [
      ['STEP 0 / 4 · THE GAP', 'One tooth is missing.', 'A gap affects more than appearance: the jawbone at that site gradually shrinks, and neighbouring teeth can shift. An implant replaces the root so the bone can continue to bear chewing forces.'],
      ['STEP 1 / 4 · FIXTURE', 'The titanium root goes in.', 'Under local anaesthetic, the clinician places the titanium fixture in the jawbone using a 3D printed guide. Over the next 3–6 months it bonds with the bone, creating a stable foundation.'],
      ['STEP 2 / 4 · ABUTMENT', 'A connector through the gum.', 'Once the fixture has bonded with the bone, the clinician attaches an abutment. It passes through the gum and connects the fixture to the visible crown.'],
      ['STEP 3 / 4 · CROWN', 'The tooth you can see.', 'A zirconia crown is made to match the shape, shade and bite of your neighbouring teeth and then secured to the abutment.'],
      ['COMPLETE', 'A fixed tooth that works like your own.', 'You can chew, speak and laugh normally without removing it at night. Daily cleaning and regular check-ups support long-term care. Next, see how All-on-4 / All-on-6 rebuilds a whole arch.'],
    ],
    controls: ['Play', 'Pause', 'Back', 'Next', 'Replay', 'Animation complete · See how All-on-4 / 6 rebuilds a whole arch'],
    diagram: 'Dental implant parts and placement sequence', progress: 'Animation progress', film: 'Nine-step dental implant video', playFilm: 'Play the dental implant video', transcript: 'Video transcript · All nine steps',
    labels: ['Gap', 'Fixture', 'Abutment', 'Crown'],
    chapters: [
      'Consultation and assessment — Your surgeon assesses the missing teeth, bone volume, medical history and the function you hope to restore.',
      'CBCT and panoramic imaging — Before any drilling, a 3D scan maps bone height, nerve positions and sinus anatomy.',
      'Digital treatment plan — The size, depth and angle of the implant are planned virtually, rather than decided at the chairside.',
      'Surgical guide and implant components — The implant, abutment and crown are parts of an original system. The implant sits in bone, the abutment passes through the gum, and the crown or bridge is attached above it.',
      'Guided implant placement — A printed guide controls the bone preparation. The procedure follows sterile protocols in a hospital-grade operating room.',
      'Healing and osseointegration — Bone bonds to the titanium surface over 3–6 months while a fixed temporary restoration is worn.',
      'Abutment and ALL-ON-4 / ALL-ON-6 — Four or six implants support a fixed full arch; the rear implants are angled to avoid the sinus.',
      'Final bridge delivery — The zirconia bridge is fitted and secured, and the bite and fit are checked and confirmed.',
      'Before-and-after review — Your post-operative care plan, implant passport and follow-up schedule go home with you.',
    ],
  },
  id: {
    steps: [
      ['TAHAP 0 / 4 · GIGI HILANG', 'Satu gigi hilang.', 'Ruang kosong bukan sekadar masalah penampilan. Tulang rahang di area itu perlahan menyusut, dan gigi di sekitarnya dapat bergeser. Implan menggantikan akar agar tulang tetap menerima beban kunyah.'],
      ['TAHAP 1 / 4 · IMPLAN', 'Akar titanium dipasang.', 'Dengan anestesi lokal, dokter memasang implan titanium ke tulang rahang menggunakan panduan cetak 3D. Implan menyatu dengan tulang dalam 3–6 bulan berikutnya untuk membentuk landasan yang stabil.'],
      ['TAHAP 2 / 4 · ABUTMEN', 'Penghubung yang menembus gusi.', 'Setelah implan menyatu dengan tulang, dokter memasang abutmen. Komponen ini menembus gusi dan menghubungkan implan dengan mahkota yang terlihat.'],
      ['TAHAP 3 / 4 · MAHKOTA', 'Gigi yang terlihat dipasang.', 'Mahkota zirkonia dibuat menyesuaikan bentuk, warna, dan gigitan gigi di sekitarnya, lalu dipasang tetap pada abutmen.'],
      ['SELESAI', 'Gigi tetap yang berfungsi seperti gigi sendiri.', 'Anda dapat mengunyah, berbicara, dan tertawa seperti biasa tanpa melepasnya pada malam hari. Pembersihan harian dan pemeriksaan berkala membantu perawatan jangka panjang. Berikutnya, lihat bagaimana All-on-4 / All-on-6 memulihkan satu lengkung gigi penuh.'],
    ],
    controls: ['Putar', 'Jeda', 'Sebelumnya', 'Berikutnya', 'Ulangi', 'Animasi selesai · Lihat cara All-on-4 / 6 memulihkan satu lengkung gigi penuh'],
    diagram: 'Komponen implan gigi dan urutan pemasangan', progress: 'Progres animasi', film: 'Video sembilan tahap implan gigi', playFilm: 'Putar video implan gigi', transcript: 'Transkrip video · Sembilan tahap',
    labels: ['Gigi hilang', 'Implan', 'Abutmen', 'Mahkota'],
    chapters: [
      'Konsultasi dan penilaian — Dokter bedah menilai gigi yang hilang, volume tulang, riwayat medis, dan fungsi yang ingin Anda pulihkan.',
      'CBCT dan pencitraan panoramik — Sebelum pengeboran, pemindaian 3D memetakan tinggi tulang, posisi saraf, dan anatomi sinus.',
      'Rencana perawatan digital — Ukuran, kedalaman, dan sudut implan direncanakan secara virtual, bukan ditentukan mendadak di kursi perawatan.',
      'Panduan bedah dan komponen implan — Implan, abutmen, dan mahkota berasal dari sistem asli. Implan berada dalam tulang, abutmen melewati gusi, dan mahkota atau jembatan dipasang di atasnya.',
      'Pemasangan implan terpandu — Panduan cetak mengendalikan preparasi tulang. Prosedur mengikuti protokol steril di ruang operasi berstandar rumah sakit.',
      'Penyembuhan dan osseointegrasi — Tulang menyatu dengan permukaan titanium selama 3–6 bulan, sementara restorasi sementara yang tetap dipakai.',
      'Abutmen dan ALL-ON-4 / ALL-ON-6 — Empat atau enam implan menopang satu lengkung gigi tetap; implan belakang dimiringkan untuk menghindari sinus.',
      'Pemasangan jembatan akhir — Jembatan zirkonia dipasang dan dikencangkan, lalu gigitan dan kesesuaiannya diperiksa dan dikonfirmasi.',
      'Tinjauan sebelum dan sesudah — Rencana perawatan pascaoperasi, paspor implan, dan jadwal kontrol dibawa pulang bersama Anda.',
    ],
  },
  ms: {
    steps: [
      ['LANGKAH 0 / 4 · GIGI HILANG', 'Satu gigi hilang.', 'Ruang kosong bukan sekadar menjejaskan penampilan. Tulang rahang di tempat itu beransur-ansur menyusut dan gigi bersebelahan boleh beralih. Implan menggantikan akar supaya tulang terus menanggung daya kunyahan.'],
      ['LANGKAH 1 / 4 · IMPLAN', 'Akar titanium dipasang.', 'Dengan bius setempat, doktor memasang implan titanium pada tulang rahang menggunakan panduan cetakan 3D. Implan bercantum dengan tulang dalam tempoh 3–6 bulan seterusnya untuk membentuk asas yang stabil.'],
      ['LANGKAH 2 / 4 · ABUTMEN', 'Penyambung yang melalui gusi.', 'Selepas implan bercantum dengan tulang, doktor memasang abutmen. Komponen ini melalui gusi dan menyambungkan implan kepada mahkota yang kelihatan.'],
      ['LANGKAH 3 / 4 · MAHKOTA', 'Gigi yang kelihatan dipasang.', 'Mahkota zirkonia dibuat mengikut bentuk, warna dan gigitan gigi bersebelahan, kemudian dipasang pada abutmen.'],
      ['SELESAI', 'Gigi tetap yang berfungsi seperti gigi sendiri.', 'Anda boleh mengunyah, bercakap dan ketawa seperti biasa tanpa menanggalkannya pada waktu malam. Pembersihan harian dan pemeriksaan berkala menyokong penjagaan jangka panjang. Seterusnya, lihat cara All-on-4 / All-on-6 membina semula satu lengkung gigi penuh.'],
    ],
    controls: ['Main', 'Jeda', 'Sebelumnya', 'Seterusnya', 'Ulang', 'Animasi selesai · Lihat cara All-on-4 / 6 membina semula satu lengkung gigi penuh'],
    diagram: 'Komponen implan gigi dan urutan pemasangan', progress: 'Kemajuan animasi', film: 'Video sembilan langkah implan gigi', playFilm: 'Mainkan video implan gigi', transcript: 'Transkrip video · Kesemua sembilan langkah',
    labels: ['Gigi hilang', 'Implan', 'Abutmen', 'Mahkota'],
    chapters: [
      'Konsultasi dan penilaian — Pakar bedah menilai gigi yang hilang, isi padu tulang, sejarah perubatan dan fungsi yang ingin anda pulihkan.',
      'CBCT dan pengimejan panoramik — Sebelum sebarang penggerudian, imbasan 3D memetakan ketinggian tulang, kedudukan saraf dan anatomi sinus.',
      'Pelan rawatan digital — Saiz, kedalaman dan sudut implan dirancang secara maya, bukan ditentukan secara mendadak di kerusi rawatan.',
      'Panduan pembedahan dan komponen implan — Implan, abutmen dan mahkota ialah sebahagian daripada sistem asli. Implan berada dalam tulang, abutmen melalui gusi dan mahkota atau jambatan dipasang di atasnya.',
      'Pemasangan implan berpandu — Panduan cetakan mengawal penyediaan tulang. Prosedur mengikut protokol steril di bilik bedah setaraf hospital.',
      'Penyembuhan dan osseointegrasi — Tulang bercantum dengan permukaan titanium dalam tempoh 3–6 bulan sementara restorasi sementara yang tetap dipakai.',
      'Abutmen dan ALL-ON-4 / ALL-ON-6 — Empat atau enam implan menyokong satu lengkung gigi tetap; implan belakang dicondongkan untuk mengelakkan sinus.',
      'Pemasangan jambatan akhir — Jambatan zirkonia dipasang dan diketatkan, kemudian gigitan dan kesesuaiannya diperiksa serta disahkan.',
      'Semakan sebelum dan selepas — Pelan penjagaan selepas pembedahan, pasport implan dan jadual susulan dibawa pulang bersama anda.',
    ],
  },
  pt: {
    steps: [
      ['ETAPA 0 / 4 · DENTE AUSENTE', 'Falta um dente.', 'O espaço afeta mais do que a aparência. O osso da mandíbula nessa zona diminui gradualmente e os dentes vizinhos podem deslocar-se. O implante substitui a raiz para que o osso continue a suportar as forças da mastigação.'],
      ['ETAPA 1 / 4 · IMPLANTE', 'É colocada a raiz de titânio.', 'Com anestesia local, o médico coloca o implante de titânio no osso maxilar com uma guia impressa em 3D. O implante integra-se no osso ao longo dos 3–6 meses seguintes, criando uma base estável.'],
      ['ETAPA 2 / 4 · PILAR', 'Um conector que atravessa a gengiva.', 'Após a integração com o osso, o médico coloca o pilar. Este atravessa a gengiva e liga o implante à coroa visível.'],
      ['ETAPA 3 / 4 · COROA', 'Coloca-se o dente visível.', 'A coroa de zircónia é feita para corresponder à forma, à cor e à mordida dos dentes vizinhos e depois é fixada ao pilar.'],
      ['CONCLUÍDO', 'Um dente fixo que funciona como o seu.', 'Pode mastigar, falar e rir normalmente sem o retirar à noite. A limpeza diária e as consultas regulares ajudam a mantê-lo. A seguir, veja como o All-on-4 / All-on-6 reconstrói uma arcada completa.'],
    ],
    controls: ['Reproduzir', 'Pausar', 'Anterior', 'Seguinte', 'Repetir', 'Animação concluída · Veja como o All-on-4 / 6 reconstrói uma arcada completa'],
    diagram: 'Componentes do implante dentário e sequência de colocação', progress: 'Progresso da animação', film: 'Vídeo do implante dentário em nove etapas', playFilm: 'Reproduzir o vídeo do implante dentário', transcript: 'Transcrição do vídeo · As nove etapas',
    labels: ['Dente ausente', 'Implante', 'Pilar', 'Coroa'],
    chapters: [
      'Consulta e avaliação — O cirurgião avalia os dentes ausentes, o volume ósseo, o historial clínico e a função que pretende recuperar.',
      'CBCT e imagiologia panorâmica — Antes de qualquer perfuração, uma imagem 3D mapeia a altura óssea, a posição dos nervos e a anatomia dos seios maxilares.',
      'Plano digital de tratamento — O tamanho, a profundidade e o ângulo do implante são planeados virtualmente, em vez de decididos junto à cadeira.',
      'Guia cirúrgica e componentes do implante — O implante, o pilar e a coroa pertencem a um sistema original. O implante fica no osso, o pilar atravessa a gengiva e a coroa ou ponte é colocada por cima.',
      'Colocação guiada do implante — Uma guia impressa controla a preparação óssea. O procedimento segue protocolos de esterilidade numa sala operatória de nível hospitalar.',
      'Cicatrização e osteointegração — O osso une-se à superfície de titânio ao longo de 3–6 meses, enquanto usa uma restauração provisória fixa.',
      'Pilar e ALL-ON-4 / ALL-ON-6 — Quatro ou seis implantes sustentam uma arcada fixa; os implantes posteriores são inclinados para evitar o seio maxilar.',
      'Entrega da ponte definitiva — A ponte de zircónia é colocada e fixada, e a mordida e a adaptação são verificadas e confirmadas.',
      'Revisão antes e depois — Leva para casa o plano de cuidados pós-operatórios, o passaporte do implante e o calendário de acompanhamento.',
    ],
  },
} satisfies Record<Locale, ImplantMediaCopy>
