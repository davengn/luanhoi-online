import { HellLevelConfig, RealmId, Vector3D, WisdomEntry } from './types';

export interface WorldNpcDialogueTopic {
  id: string;
  title: string;
  prompt: string;
  response: string;
  culturalNote?: string;
}

export interface WorldNpcConfig {
  id: string;
  name: string;
  title: string;
  role: string;
  realm: RealmId;
  position: Vector3D;
  rotationY: number;
  robeColor: string;
  accentColor: string;
  greeting: string;
  culturalOrigin: 'buddhist_monastic' | 'buddhist_dharmapala' | 'xianxia_celestial' | 'folk_underworld';
  dialogueTopics: WorldNpcDialogueTopic[];
}

/**
 * ALL 18 LEVELS OF HELL (THẬP BÁT TẦNG ĐỊA NGỤC)
 * Framed as allegorical mirrors of unwholesome mental states (Tâm tạo cảnh)
 * rather than eternal damnation. Every level provides a path of awakening and redemption.
 */
export const HELL_LEVELS: HellLevelConfig[] = [
  {
    level: 1,
    codeName: 'vong_ngon',
    vietnameseName: 'Địa Ngục Vọng Ngôn',
    englishSubtitle: 'Labyrinth of Whispered Lies',
    karmaThreshold: -100,
    themeSin: 'Vọng ngữ, nói dối, thêu dệt chuyện sai sự thật gây hiểu lầm',
    environmentDescription:
      'Mê cung đá xám tím ngập trong sương mù âm vang những lời thì thầm sai lệch. Mỗi lời dối trá từng thốt ra nơi trần thế kết tinh thành những bức tường mặt nạ xương trắng chặn lối trở về.',
    architectureStyle: 'Hành lang đá cổ khắc mặt nạ hai mặt và các trụ ống dẫn âm vọng vô tận',
    colorPalette: {
      primary: '#3b3355',
      secondary: '#7a6c9d',
      fogColor: '#1f1a2e',
      ambientLight: '#8e7cc3',
      accentGlow: '#c4b5fd',
    },
    ambientSoundProfile: 'whisper_echo',
    wardenNpc: {
      name: 'Ngục Chủ Thiệt Kính',
      title: 'Giám Ngục Tầng Thứ Nhất — Vọng Ngôn',
      dialogueIntro:
        'Người đời tưởng lời nói gió bay, nhưng ở cõi này mỗi lời dối trá đều hóa thành vách đá giam tâm. Ngươi có dám đối diện với sự thật mà mình từng che giấu?',
      dialogueRedemption:
        'Khi lời chân thật cất lên từ tâm hổ thẹn, vách đá mê lầm tự khắc tan biến. Hãy giữ gìn Chánh Ngữ khi trở lại nhân gian.',
    },
    punishmentMechanic:
      'Những bóng âm thanh lặp lại lời nói dối làm đảo ngược phương hướng cho đến khi hành giả tìm về Bia Chân Ngôn.',
    challengeType: 'truth_labyrinth',
    redemptionQuest: {
      title: 'Khơi Sáng Bia Chân Ngôn',
      objective: 'Tìm và thắp sáng 3 Bia Chân Ngôn giữa mê cung bằng tâm thành thật.',
      requiredActions: 3,
      reflectionPrompt:
        'Khi đứng trước một lỗi lầm của bản thân, điều gì giúp tâm thoát khỏi mê cung của sự dối trá?',
      choices: [
        {
          text: 'Dũng cảm thừa nhận sự thật, xin lỗi người bị tổn thương và giữ giới Không Nói Dối (Chánh Ngữ).',
          isAwakened: true,
          karmaRestored: 100,
          feedback:
            'Ánh sáng Chân Ngôn tỏa rạng! Kinh Pháp Cú dạy: người biết nhận lỗi và sửa đổi sẽ chiếu sáng thế gian như trăng thoát khỏi mây.',
        },
        {
          text: 'Im lặng che giấu với hy vọng thời gian sẽ làm mọi người quên đi.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Sự che giấu chỉ khiến bức tường mê cung thêm dày đặc. Hãy chiêm nghiệm lại sức mạnh của lòng chân thật.',
        },
        {
          text: 'Dùng một lời nói dối khéo léo hơn để hợp thức hóa lời nói dối trước đó.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Một lời vọng ngôn sinh ra trăm lời vọng ngôn khác. Chưa thể thoát khỏi Tầng Vọng Ngôn.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 2,
    codeName: 'trong_tham',
    vietnameseName: 'Địa Ngục Trọng Tham',
    englishSubtitle: 'Mirage Desert of Endless Greed',
    karmaThreshold: -250,
    themeSin: 'Tham lam vô độ, tích trữ ích kỷ, bỏn xẻn trước nỗi khổ của tha nhân',
    environmentDescription:
      'Sa mạc cát vàng khô cháy trải dài vô tận với những lâu đài châu báu ảo ảnh. Càng cố ôm giữ những đồng tiền âm phủ, đôi chân hành giả càng lún sâu vào cát nặng như chì.',
    architectureStyle: 'Đền đài vàng son đổ nát vùi nửa mình trong bão cát và những chiếc bát đá rỗng không',
    colorPalette: {
      primary: '#6b4c1b',
      secondary: '#b8860b',
      fogColor: '#2c1f0b',
      ambientLight: '#d4af37',
      accentGlow: '#fbbf24',
    },
    ambientSoundProfile: 'desert_wind',
    wardenNpc: {
      name: 'Ngục Chủ Kim Sa',
      title: 'Giám Ngục Tầng Thứ Hai — Trọng Tham',
      dialogueIntro:
        'Cát vàng nơi đây đều từ lòng tham không đáy của thế nhân mà thành. Ôm càng nhiều vàng giả, bước chân càng nặng nề. Ngươi muốn giữ ảo ảnh hay muốn tìm lại tự do?',
      dialogueRedemption:
        'Hai bàn tay buông xuống mới có thể nâng đỡ muôn loài. Tri túc tiện thường lạc — biết đủ chính là giàu có nhất.',
    },
    punishmentMechanic:
      'Trọng lực gia tăng theo lòng tham; hành giả phải buông bỏ các kho báu ảo ảnh vào Bát Bố Thí để bước đi nhẹ nhàng.',
    challengeType: 'greed_renunciation',
    redemptionQuest: {
      title: 'Buông Vàng Trả Cát — Học Hạnh Bố Thí',
      objective: 'Thực hành buông xả châu báu ảo ảnh tại 3 Bát Bố Thí giữa sa mạc.',
      requiredActions: 3,
      reflectionPrompt:
        'Đứng trước của cải và danh lợi thế gian, thái độ nào đem lại sự giàu có chân thật và bình an lâu dài?',
      choices: [
        {
          text: 'Biết đủ (Tri túc) và hoan hỷ sẻ chia, dùng tài vật giúp người qua cơn ngặt nghèo.',
          isAwakened: true,
          karmaRestored: 250,
          feedback:
            'Cát vàng hóa thành hoa sen mát dịu! Hạnh Bố Thí (Dāna) phá tan ngục tù của lòng tham.',
        },
        {
          text: 'Chỉ cho đi khi chắc chắn mình sẽ nhận lại lợi ích gấp đôi.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đó vẫn là sự trao đổi của tâm toan tính, chưa phải hạnh Bố Thí thanh tịnh.',
        },
        {
          text: 'Tích trữ thật nhiều cho riêng mình vì sợ ngày mai thiếu thốn.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Lòng tham như nước mặn, càng uống càng khát. Sa mạc Trọng Tham vẫn chưa mở lối.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 3,
    codeName: 'liet_san',
    vietnameseName: 'Địa Ngục Liệt Sân',
    englishSubtitle: 'Volcanic Crater of Wrath',
    karmaThreshold: -400,
    themeSin: 'Sân hận dữ dội, nóng giận mất kiểm soát, làm tổn thương người khác trong cơn thịnh nộ',
    environmentDescription:
      'Thung lũng đá hắc diện thạch nứt toác bên trên dòng dung nham đỏ rực. Mỗi ý niệm phẫn nộ làm bùng lên những cột lửa thiêu đốt chính tâm thức người đang giận dữ.',
    architectureStyle: 'Cầu đá bazan đen bắc qua hồ dung nham và những trụ đồng khắc thần chú Nhẫn Nhục',
    colorPalette: {
      primary: '#5c1414',
      secondary: '#991b1b',
      fogColor: '#2a0808',
      ambientLight: '#ef4444',
      accentGlow: '#f97316',
    },
    ambientSoundProfile: 'volcanic_storm',
    wardenNpc: {
      name: 'Ngục Chủ Viêm Nộ',
      title: 'Giám Ngục Tầng Thứ Ba — Liệt Sân',
      dialogueIntro:
        'Lửa địa ngục không từ đâu đến, chính là ngọn lửa sân hận trong tim ngươi tự đốt mình trước khi đốt người. Ngươi còn muốn lấy oán báo oán đến bao giờ?',
      dialogueRedemption:
        'Một niệm sân tâm khởi, trăm vạn cửa chướng khai; một niệm từ tâm mát, lửa dữ hóa đài sen.',
    },
    punishmentMechanic:
      'Nhiệt độ dung nham bùng phát khi hành giả di chuyển vội vã; phải tịnh tâm dẫn nước cam lộ tại các mạch lửa.',
    challengeType: 'anger_quell',
    redemptionQuest: {
      title: 'Cam Lộ Dập Lửa Sân',
      objective: 'Thiền định dẫn nước mát Nhẫn Nhục làm dịu 3 mạch dung nham đang phun trào.',
      requiredActions: 3,
      reflectionPrompt:
        'Khi bị xúc phạm hoặc gặp chuyện trái ý, làm thế nào để dập tắt ngọn lửa giận dữ trong tâm?',
      choices: [
        {
          text: 'Quay về giữ hơi thở chánh niệm, thực hành Nhẫn Nhục và khởi tâm Từ Bi thương người đang mê lầm.',
          isAwakened: true,
          karmaRestored: 400,
          feedback:
            'Dung nham lắng dịu thành hồ nước trong! Như Kinh Pháp Cú (kệ số 5) dạy: "Lấy không hận diệt hận, ấy là định luật ngàn thu."',
        },
        {
          text: 'Đáp trả ngay lập tức để đối phương biết sợ mà không dám coi thường mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Ném thêm củi vào lửa chỉ làm đám cháy lớn hơn. Ngọn lửa Liệt Sân vẫn chưa tắt.',
        },
        {
          text: 'Kìm nén cơn giận trong lòng và chờ cơ hội trả đũa sau.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Than hồng vùi dưới tro vẫn âm ỉ thiêu đốt tâm can. Hãy buông bỏ hẳn tâm oán giận.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 4,
    codeName: 'kinh_do_ky',
    vietnameseName: 'Địa Ngục Kính Đố Kỵ',
    englishSubtitle: 'Hall of Envious Mirrors',
    karmaThreshold: -550,
    themeSin: 'Đố kỵ, ganh ghét khi thấy người khác thành công hay hạnh phúc',
    environmentDescription:
      'Điện bát giác lắp đầy hàng ngàn tấm gương đồng ánh xanh lục bảo lạnh lẽo. Kẻ mang lòng ganh tỵ nhìn vào gương chỉ thấy hình bóng méo mó, cô độc của chính mình.',
    architectureStyle: 'Cung điện gương đồng cổ với mái vòm phản chiếu vô cực và những khung gương rạn nứt',
    colorPalette: {
      primary: '#0f3d3e',
      secondary: '#1b6b63',
      fogColor: '#071f20',
      ambientLight: '#2dd4bf',
      accentGlow: '#34d399',
    },
    ambientSoundProfile: 'mirror_chime',
    wardenNpc: {
      name: 'Ngục Chủ Tật Đố',
      title: 'Giám Ngục Tầng Thứ Tư — Kính Đố Kỵ',
      dialogueIntro:
        'Ánh sáng của người khác vốn chẳng làm tối đi ngọn đèn của ngươi. Cớ sao nhìn người an vui, lòng ngươi lại đau khổ như bị gai đâm?',
      dialogueRedemption:
        'Tùy hỷ công đức — vui với niềm vui của người chính là nhân đôi phước báu của chính mình.',
    },
    punishmentMechanic:
      'Các tấm gương tạo ra ảo ảnh so sánh hơn thua; hành giả phải lau sáng gương bằng tâm Tùy Hỷ.',
    challengeType: 'mirror_reflection',
    redemptionQuest: {
      title: 'Lau Sáng Gương Tùy Hỷ',
      objective: 'Thực hành chúc phúc và lau sạch 3 Tấm Gương Đồng đang bị phủ mờ bởi lòng ganh tỵ.',
      requiredActions: 3,
      reflectionPrompt:
        'Khi thấy người đồng tu hoặc bạn bè đạt được thành tựu vượt trội hơn mình, tâm thức giác ngộ sẽ ứng xử thế nào?',
      choices: [
        {
          text: 'Khởi tâm Tùy Hỷ (Muditā) chân thành chúc mừng họ và lấy đó làm động lực tinh tấn.',
          isAwakened: true,
          karmaRestored: 550,
          feedback:
            'Mặt gương sáng trong phản chiếu hào quang thanh tịnh! Tâm Tùy Hỷ là một trong Tứ Vô Lượng Tâm cao quý.',
        },
        {
          text: 'Tìm điểm yếu của họ để tự trấn an rằng họ cũng chẳng hoàn hảo.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'So đo và bới móc lỗi người chỉ làm tấm gương tâm hồn thêm rạn nứt.',
        },
        {
          text: 'Quay lưng bỏ đi và từ chối nhìn nhận thành quả của bất kỳ ai.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Khép kín tâm mình trong sự lạnh nhạt chưa thể hóa giải gốc rễ của lòng đố kỵ.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 5,
    codeName: 'vuc_boi_tin',
    vietnameseName: 'Địa Ngục Vực Bội Tín',
    englishSubtitle: 'Chasm of Broken Vows',
    karmaThreshold: -700,
    themeSin: 'Bội tín, phản bội lòng tin của bạn bè và cộng đồng, nuốt lời hứa trọng đại',
    environmentDescription:
      'Vực thẳm sương lam sâu thăm thẳm với những cây cầu đá đứt gãy lơ lửng. Phía dưới vực là muôn vàn thẻ ngọc thề nguyền bị đập vỡ của những kẻ phụ bạc lòng tin.',
    architectureStyle: 'Cầu treo đá phiến gãy nhịp bắc qua vực sâu và những cột trụ khắc chữ Tín cổ xưa',
    colorPalette: {
      primary: '#1e293b',
      secondary: '#3b82f6',
      fogColor: '#0f172a',
      ambientLight: '#60a5fa',
      accentGlow: '#93c5fd',
    },
    ambientSoundProfile: 'collapsing_stone',
    wardenNpc: {
      name: 'Ngục Chủ Đoạn Thệ',
      title: 'Giám Ngục Tầng Thứ Năm — Vực Bội Tín',
      dialogueIntro:
        'Lòng tin giữa người với người như nhịp cầu qua vực thẳm. Khi ngươi tự tay đập gãy lời hứa vì tư lợi, ngươi cũng tự cắt đứt con đường của chính mình.',
      dialogueRedemption:
        'Người có chữ Tín đi đến đâu cũng có đường lành nâng bước. Hãy trân trọng từng lời hứa khi trở về.',
    },
    punishmentMechanic:
      'Các nhịp cầu sụp đổ dưới chân nếu bước đi thiếu chánh niệm; phải kết nối lại các trụ đá Tín Nghĩa.',
    challengeType: 'bridge_of_vows',
    redemptionQuest: {
      title: 'Nối Lại Nhịp Cầu Tín Nghĩa',
      objective: 'Đặt lại 3 Viên Đá Tín Nghĩa để nối liền cây cầu vượt qua vực thẳm.',
      requiredActions: 3,
      reflectionPrompt:
        'Điều gì làm nên nền tảng vững chắc nhất cho mọi mối nhân duyên thiện lành giữa người với người?',
      choices: [
        {
          text: 'Giữ trọn chữ Tín, lời nói đi đôi với việc làm, thà chịu thiệt thòi chứ không phụ lòng tin của người.',
          isAwakened: true,
          karmaRestored: 700,
          feedback:
            'Nhịp cầu ánh sáng nối liền hai bờ vực! Sự chân thật và chữ Tín đã đưa bạn trở lại con đường sáng.',
        },
        {
          text: 'Hứa hẹn thật nhiều để làm vừa lòng người khác trước, còn thực hiện được hay không tính sau.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Lời hứa suông như đá bọt, bước lên ắt sẽ sụp đổ.',
        },
        {
          text: 'Cho rằng lời hứa chỉ có giá trị khi nó còn mang lại lợi ích cho bản thân.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Tâm vụ lợi khiến vực thẳm Bội Tín càng thêm sâu rộng.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 6,
    codeName: 'han_vo_tinh',
    vietnameseName: 'Địa Ngục Hàn Vô Tình',
    englishSubtitle: 'Glacier of Callous Indifference',
    karmaThreshold: -900,
    themeSin: 'Vô cảm, lạnh lùng quay lưng trước nỗi đau và sự nguy khốn của đồng loại',
    environmentDescription:
      'Cánh đồng băng giá xanh đen bất tận với những tháp băng cao vút. Gió tuyết gào thét đóng băng những tâm hồn từng dửng dưng đứng nhìn người khác gặp nạn mà không mảy may động lòng.',
    architectureStyle: 'Thành trì băng tuyết vĩnh cửu và những đài lửa đồng bị tuyết vùi lấp',
    colorPalette: {
      primary: '#164e63',
      secondary: '#0284c7',
      fogColor: '#082f49',
      ambientLight: '#7dd3fc',
      accentGlow: '#bae6fd',
    },
    ambientSoundProfile: 'blizzard_howl',
    wardenNpc: {
      name: 'Ngục Chủ Hàn Băng',
      title: 'Giám Ngục Tầng Thứ Sáu — Hàn Vô Tình',
      dialogueIntro:
        'Không phải gió phương Bắc làm đóng băng tầng ngục này, mà chính là ánh mắt thờ ơ của ngươi trước giọt nước mắt của tha nhân. Ngươi có cảm nhận được cái lạnh của sự cô lập tuyệt đối?',
      dialogueRedemption:
        'Một ngọn lửa từ bi thắp lên, cả vạn dặm băng hà đều tan chảy. Con người sinh ra là để nâng đỡ nhau.',
    },
    punishmentMechanic:
      'Bão tuyết làm giảm tốc độ di chuyển; hành giả phải thắp sáng các Lò Lửa Đồng Cảm để sưởi ấm những linh hồn giá lạnh.',
    challengeType: 'soul_warmth',
    redemptionQuest: {
      title: 'Thắp Lửa Từ Bi Giữa Băng Hà',
      objective: 'Truyền hơi ấm tâm từ để thắp sáng 3 Lò Lửa Đồng Cảm giữa cánh đồng tuyết.',
      requiredActions: 3,
      reflectionPrompt:
        'Khi chứng kiến một người đang gặp hoạn nạn giữa đường, thái độ nào giúp phá tan băng giá của sự vô cảm?',
      choices: [
        {
          text: 'Mở lòng cảm thông (Tâm Bi — Karuṇā), sẵn sàng dừng bước sẻ chia và cứu giúp trong khả năng của mình.',
          isAwakened: true,
          karmaRestored: 900,
          feedback:
            'Băng tuyết tan chảy thành suối ấm! Tâm Bi mẫn chính là ngọn lửa sưởi ấm cả tam giới.',
        },
        {
          text: 'Nghĩ rằng "ai có nghiệp người nấy chịu" rồi lạnh lùng bước qua.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Hiểu lầm luật Nhân Quả để biện minh cho sự vô cảm là một sai lầm lớn. Đức Phật luôn dạy đệ tử phải giàu lòng Từ Bi cứu khổ.',
        },
        {
          text: 'Đứng nhìn từ xa với sự tò mò nhưng sợ phiền phức nên không giúp đỡ.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Sự thờ ơ trước nỗi khổ của đồng loại vẫn giữ chân bạn trong băng giá Hàn Vô Tình.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 7,
    codeName: 'hoa_ac_khau',
    vietnameseName: 'Địa Ngục Hỏa Ác Khẩu',
    englishSubtitle: 'Furnace of Venomous Tongues',
    karmaThreshold: -1100,
    themeSin: 'Ác khẩu, lưỡng thiệt, dùng lời lẽ cay độc miệt thị và chia rẽ cộng đồng',
    environmentDescription:
      'Lò luyện đồng rực lửa với những quả chuông sắt khổng lồ khắc văn tự sắc nhọn. Tàn lửa bay trong không trung như mũi tên gai — hóa hiện từ những lời nguyền rủa, mạt sát và chia rẽ người khác.',
    architectureStyle: 'Lò đồng cổ đại treo chuông sắt và những hành lang trụ lửa khắc thần chú Tịnh Khẩu',
    colorPalette: {
      primary: '#7c2d12',
      secondary: '#ea580c',
      fogColor: '#431407',
      ambientLight: '#fb923c',
      accentGlow: '#fdba74',
    },
    ambientSoundProfile: 'fire_roar',
    wardenNpc: {
      name: 'Ngục Chủ Xích Thiệt',
      title: 'Giám Ngục Tầng Thứ Bảy — Hỏa Ác Khẩu',
      dialogueIntro:
        'Lưỡi không xương nhưng sắc hơn gươm đao, một lời độc ác có thể hủy hoại danh dự và bình an của cả một đời người. Nay những lời ấy hóa thành mưa lửa, ngươi tính sao?',
      dialogueRedemption:
        'Lời nói chẳng mất tiền mua, lựa lời hòa ái mà thưa với người. Ái ngữ như hoa sen thơm ngát giữa đời.',
    },
    punishmentMechanic:
      'Mưa tàn lửa rơi từ vòm lò; hành giả phải ngân vang Chuông Ái Ngữ để hóa giải tàn lửa thành mưa hoa.',
    challengeType: 'mantra_shield',
    redemptionQuest: {
      title: 'Ngân Chuông Ái Ngữ Tịnh Khẩu Nghiệp',
      objective: 'Thỉnh 4 Tiếng Chuông Ái Ngữ để hóa giải mưa lửa ác khẩu trong lò đồng.',
      requiredActions: 4,
      reflectionPrompt:
        'Trước khi cất lời nhận xét hay góp ý với một ai đó, người tu học cần quán chiếu điều gì?',
      choices: [
        {
          text: 'Quán chiếu lời nói có đúng sự thật, có lợi ích, đúng thời điểm và xuất phát từ lòng từ ái hay không.',
          isAwakened: true,
          karmaRestored: 1100,
          feedback:
            'Tiếng chuông ngân vang làm dịu lò lửa! Đó chính là 5 tiêu chuẩn Chánh Ngữ mà Đức Phật dạy trong Kinh Lời Nói Chân Thật (Subhāsita Sutta).',
        },
        {
          text: 'Nói thật nặng lời và cay nghiệt với lý do "thuốc đắng dã tật, sự thật mất lòng".',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Chân lý nói ra bằng tâm sân hận và khinh miệt thì vẫn là Ác Khẩu, chỉ gây tổn thương chứ không giúp người chuyển hóa.',
        },
        {
          text: 'Hùa theo đám đông chế giễu người khác để mua vui.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Lời chế giễu vô tâm tạo ra khẩu nghiệp nặng nề. Lò Hỏa Ác Khẩu vẫn chưa mở lối.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 8,
    codeName: 'me_dao_tac',
    vietnameseName: 'Địa Ngục Mê Đạo Tặc',
    englishSubtitle: 'Shifting Vault of Stolen Karma',
    karmaThreshold: -1300,
    themeSin: 'Trộm cắp, lừa đảo, chiếm đoạt công sức và tài sản không thuộc về mình',
    environmentDescription:
      'Mật thất đá chồng chất theo cấu trúc không gian đảo ngược với hàng trăm bánh răng đồng xoay chuyển. Những kẻ từng lấy của không cho đều bị nhốt trong chính chiếc rương báu mà họ đánh cắp.',
    architectureStyle: 'Mật thất bánh răng đồng thau xoay chuyển và những bệ thờ bảo vật bị bỏ trống',
    colorPalette: {
      primary: '#3f3f46',
      secondary: '#a16207',
      fogColor: '#18181b',
      ambientLight: '#eab308',
      accentGlow: '#fde047',
    },
    ambientSoundProfile: 'shifting_vault',
    wardenNpc: {
      name: 'Ngục Chủ Tỏa Linh',
      title: 'Giám Ngục Tầng Thứ Tám — Mê Đạo Tặc',
      dialogueIntro:
        'Lấy của người một đồng, trả nợ nghiệp mười phương. Mọi thứ chiếm đoạt bằng mưu gian đều biến thành ổ khóa giam cầm tâm thức ngươi trong mật thất này.',
      dialogueRedemption:
        'Trả lại những gì không thuộc về mình, tâm liền thênh thang không chút sợ hãi.',
    },
    punishmentMechanic:
      'Các hành lang đá tự động khóa lại cho đến khi hành giả hoàn trả đủ các Pháp Khí về đúng bệ thờ.',
    challengeType: 'return_relics',
    redemptionQuest: {
      title: 'Hoàn Trả Pháp Khí — Giữ Giới Không Trộm Cắp',
      objective: 'Đưa 4 Pháp Khí bị thất lạc trở về đúng bệ thờ nguyên thủy trong mật thất.',
      requiredActions: 4,
      reflectionPrompt:
        'Làm thế nào để giữ trọn Chánh Mạng và giới thứ hai (Không lấy của không cho) trong đời sống hàng ngày?',
      choices: [
        {
          text: 'Sống bằng công sức chân chính của mình, tôn trọng tài sản và trí tuệ của người khác, dù một cọng cỏ không cho cũng không lấy.',
          isAwakened: true,
          karmaRestored: 1300,
          feedback:
            'Các bánh răng đồng mở khóa! Tâm thanh bạch không tham của phi nghĩa chính là chiếc chìa khóa tự do.',
        },
        {
          text: 'Chỉ cần không ai nhìn thấy hoặc pháp luật thế gian chưa phát hiện thì cứ lấy.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Người đời có thể không biết, nhưng Nghiệp Kính trong tâm ghi rõ từng mảy may.',
        },
        {
          text: 'Lấy của người giàu chia một ít cho mình vì nghĩ họ sẽ không nghèo đi.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Tự ý chiếm đoạt tài sản không được trao tặng đều vi phạm giới Không Trộm Cắp.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 9,
    codeName: 'thiet_bao',
    vietnameseName: 'Địa Ngục Thiết Bạo',
    englishSubtitle: 'Iron Bastion of Cruelty',
    karmaThreshold: -1500,
    themeSin: 'Bạo lực, ức hiếp kẻ yếu, cố ý gây thương tích và sát hại sinh mạng vô tội',
    environmentDescription:
      'Pháo đài sắt đen khổng lồ chằng chịt dây xích nặng nề. Những sợi xích nơi đây không do quỷ sứ rèn nên, mà kết thành từ chính những hành vi bạo ngược, hung hãn mà tội nhân từng gieo rắc.',
    architectureStyle: 'Thành lũy sắt đen với những cổng vòm dây xích và đài giải phóng sinh linh',
    colorPalette: {
      primary: '#27272a',
      secondary: '#7f1d1d',
      fogColor: '#09090b',
      ambientLight: '#dc2626',
      accentGlow: '#f87171',
    },
    ambientSoundProfile: 'iron_chains',
    wardenNpc: {
      name: 'Ngục Chủ Thiết Xiềng',
      title: 'Giám Ngục Tầng Thứ Chín — Thiết Bạo',
      dialogueIntro:
        'Kẻ cậy mạnh hiếp yếu tưởng mình là chúa tể, nào ngờ mỗi đòn roi giáng xuống muôn loài lại rèn thêm một mắt xích trói buộc chính linh hồn mình.',
      dialogueRedemption:
        'Buông đao đồ tể, tâm liền hướng thiện. Bảo hộ sự sống là cội nguồn của phước báo trường thọ và bình an.',
    },
    punishmentMechanic:
      'Tiếng xích sắt vang rền gây chấn động; hành giả phải tháo mở xiềng xích cho các linh ảnh bị giam cầm bằng tâm Bất Sát.',
    challengeType: 'unshackle_peace',
    redemptionQuest: {
      title: 'Tháo Mở Xiềng Xích — Phát Nguyện Hộ Sinh',
      objective: 'Thực hành tâm Từ Bi tháo gỡ xiềng xích cho 4 Linh Ảnh đang bị trói buộc.',
      requiredActions: 4,
      reflectionPrompt:
        'Vì sao giới Không Sát Sinh và tinh thần bất bạo động lại đứng đầu trong Ngũ Giới của người tu học?',
      choices: [
        {
          text: 'Vì mọi chúng sinh đều sợ hãi cái chết và yêu quý sự sống như chính mình; lấy mình suy ra người nên nguyện không làm hại muôn loài.',
          isAwakened: true,
          karmaRestored: 1500,
          feedback:
            'Xiềng xích sắt hóa thành ánh sáng! Đúng như Kinh Pháp Cú (kệ 129–130) dạy: "Mọi người đều sợ hình phạt, mọi người đều yêu sự sống; lấy mình làm ví dụ, chớ giết, chớ bảo giết."',
        },
        {
          text: 'Dùng bạo lực mạnh hơn để trấn áp mọi kẻ dám chống đối mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Lấy bạo lực đáp trả bạo lực chỉ làm sợi xích nghiệp lực thêm bền chặt.',
        },
        {
          text: 'Cho rằng kẻ mạnh có quyền định đoạt số phận của kẻ yếu.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đó là tà kiến của lòng kiêu ngạo và tàn nhẫn. Ngục Thiết Bạo chưa thể mở cổng.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 10,
    codeName: 'mong_nguy_tao',
    vietnameseName: 'Địa Ngục Mộng Ngụy Tạo',
    englishSubtitle: 'Phantasm Theater of Hypocrisy',
    karmaThreshold: -1700,
    themeSin: 'Đạo đức giả, mượn danh nghĩa tu hành hay việc thiện để trục lợi và thao túng người khác',
    environmentDescription:
      'Một hí trường lộng lẫy nhưng rỗng tuếch với đèn lồng giấy mạ vàng, rèm lụa đỏ tím và những con rối gỗ. Kẻ ngoài miệng nói lời đạo nghĩa nhưng trong bụng chứa dao găm bị lạc lối giữa muôn trùng bóng ảo.',
    architectureStyle: 'Hí trường cổ truyền ma mị với rèm lụa, đèn lồng ảo ảnh và sân khấu rối bóng',
    colorPalette: {
      primary: '#4a044e',
      secondary: '#a21caf',
      fogColor: '#2e1065',
      ambientLight: '#e879f9',
      accentGlow: '#f0abfc',
    },
    ambientSoundProfile: 'illusion_hum',
    wardenNpc: {
      name: 'Ngục Chủ Huyễn Diện',
      title: 'Giám Ngục Tầng Thứ Mười — Mộng Ngụy Tạo',
      dialogueIntro:
        'Trên sân khấu nhân gian, ngươi khoác áo từ bi để gom góp hư danh. Nhưng trước Nghiệp Kính Đài, lớp son phấn đạo đức giả đã trôi sạch, ngươi còn lại gì ngoài cái bóng rỗng không?',
      dialogueRedemption:
        'Trực tâm là đạo tràng! Thà làm người phàm phu chân thật còn hơn làm bậc thánh giả dối.',
    },
    punishmentMechanic:
      'Đèn lồng ảo ảnh dẫn dụ hành giả đi vòng tròn; phải dập tắt các ngọn đèn hư danh để lộ ra lối đi chân thật.',
    challengeType: 'pierce_illusion',
    redemptionQuest: {
      title: 'Phá Màn Huyễn Ảnh — Trở Về Trực Tâm',
      objective: 'Hóa giải 4 Đèn Lồng Hư Danh trong hí trường bằng sự chân thành và khiêm hạ.',
      requiredActions: 4,
      reflectionPrompt:
        'Đâu là sự khác biệt cốt lõi giữa việc làm phước chân chánh và sự phô trương đạo đức giả?',
      choices: [
        {
          text: 'Làm lành với tâm trong sáng, không cầu danh tiếng, trong ngoài như một (Trực tâm).',
          isAwakened: true,
          karmaRestored: 1700,
          feedback:
            'Bức màn ảo ảnh 걷 (vén) mở! Tâm ngay thẳng (Trực tâm) chính là đạo tràng thanh tịnh nhất.',
        },
        {
          text: 'Chỉ làm việc thiện ở nơi đông người để được ngợi khen và tôn sùng.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Chạy theo hư danh chỉ tạo thêm những chiếc đèn lồng ảo ảnh giam mình trong hí trường.',
        },
        {
          text: 'Dùng lời lẽ đạo lý cao siêu để phán xét và thao túng người khác phục vụ cho mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Mượn đạo tạo đời là nhân trực tiếp dẫn vào Tầng Mộng Ngụy Tạo.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 11,
    codeName: 'rung_vong_on',
    vietnameseName: 'Địa Ngục Rừng Vong Ơn',
    englishSubtitle: 'Withered Forest of Ingratitude',
    karmaThreshold: -1900,
    themeSin: 'Bất hiếu với cha mẹ, phản bội thầy tổ, quên ơn người từng cưu mang giúp đỡ',
    environmentDescription:
      'Khu rừng cổ thụ hóa đá khô cằn không một chiếc lá xanh, rễ cây bị đứt lìa khỏi lòng đất mẹ. Tượng trưng cho những kẻ tự cắt đứt cội nguồn ân nghĩa sinh thành và dưỡng dục.',
    architectureStyle: 'Rừng đại thụ hóa thạch xám tro với những mạch suối cạn và bia đá Tứ Trọng Ân',
    colorPalette: {
      primary: '#292524',
      secondary: '#57534e',
      fogColor: '#1c1917',
      ambientLight: '#a8a29e',
      accentGlow: '#86efac',
    },
    ambientSoundProfile: 'dark_forest',
    wardenNpc: {
      name: 'Ngục Chủ Khô Mộc',
      title: 'Giám Ngục Tầng Mười Một — Rừng Vong Ơn',
      dialogueIntro:
        'Cây không rễ thì lá héo cành khô; người quên nguồn cội thì phước đức tiêu tan. Ngươi từng nhận biết bao ân tình của cha mẹ, thầy bạn, sao nỡ quay lưng phụ bạc?',
      dialogueRedemption:
        'Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây. Tâm tri ân làm nở hoa ngay trên cành gỗ khô.',
    },
    punishmentMechanic:
      'Cành cây khô đan kín lối đi; hành giả phải dẫn Nước Nguồn Tri Ân tưới tắm lại các gốc cây cội nguồn.',
    challengeType: 'memory_gratitude',
    redemptionQuest: {
      title: 'Tưới Nước Nguồn Ân — Hồi Sinh Cội Rễ',
      objective: 'Dẫn Nước Nguồn Tri Ân tưới mát 4 Gốc Cây Cổ Thụ đại diện cho Tứ Trọng Ân.',
      requiredActions: 4,
      reflectionPrompt:
        'Trong giáo lý Phật giáo và truyền thống dân tộc, vì sao lòng Tri Ân và Báo Ân được xem là nền tảng của đạo làm người?',
      choices: [
        {
          text: 'Vì không ai tự mình lớn khôn; nhớ ơn cha mẹ, thầy tổ, xã hội và muôn loài giúp ta sống hiếu nghĩa, khiêm cung và đền đáp bằng việc lành.',
          isAwakened: true,
          karmaRestored: 1900,
          feedback:
            'Rừng cây khô đâm chồi nảy lộc xanh tươi! Kinh Tăng Chi Bộ dạy: "Tri ân và báo ân là dấu hiệu của bậc Chân Nhân."',
        },
        {
          text: 'Cho rằng mọi thành tựu của mình đều do tự thân giỏi giang, không mắc nợ ai cả.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Phủ nhận công ơn sinh thành và dưỡng dục khiến gốc rễ tâm linh tiếp tục khô héo.',
        },
        {
          text: 'Chỉ nhớ ơn khi người đó còn mang lại quyền lợi cho mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đó là sự thực dụng, không phải lòng tri ân chân thật.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 12,
    codeName: 'thanh_kieu_man',
    vietnameseName: 'Địa Ngục Thành Kiêu Mạn',
    englishSubtitle: 'Inverted Spire of Arrogance',
    karmaThreshold: -2100,
    themeSin: 'Ngã mạn tột độ, khinh miệt chúng sinh, tự coi mình đứng trên đạo lý',
    environmentDescription:
      'Ngọn bảo tháp đá cẩm thạch trắng lạnh lẽo xây ngược từ hư không xuống vực thẳm. Kẻ càng tự cao tự đại, trọng lực càng kéo họ rơi xuống đỉnh tháp cô độc không một bóng người.',
    architectureStyle: 'Bảo tháp đảo ngược với những bậc thang xoắn ốc lơ lửng giữa hư không',
    colorPalette: {
      primary: '#312e81',
      secondary: '#6366f1',
      fogColor: '#1e1b4b',
      ambientLight: '#a5b4fc',
      accentGlow: '#e0e7ff',
    },
    ambientSoundProfile: 'impossible_tower',
    wardenNpc: {
      name: 'Ngục Chủ Cô Đỉnh',
      title: 'Giám Ngục Tầng Mười Hai — Thành Kiêu Mạn',
      dialogueIntro:
        'Nước chảy xuống chỗ trũng nên làm nên biển lớn; núi tự cho mình cao nên chẳng giữ được giọt mưa nào. Đứng trên đỉnh ngã mạn cô độc này, ngươi thấy mình vĩ đại hay nhỏ bé?',
      dialogueRedemption:
        'Lúa chín là lúa biết cúi đầu. Khi buông xuống cái Ta ngạo nghễ, cả đất trời đều mở rộng đón ngươi.',
    },
    punishmentMechanic:
      'Bậc thang đảo ngược đẩy hành giả ra xa nếu đứng thẳng ngạo nghễ; phải thực hành Lễ Bái Khiêm Cung để bước xuống.',
    challengeType: 'humility_descent',
    redemptionQuest: {
      title: 'Năm Lạy Khiêm Cung — Hạ Mình Trước Đạo',
      objective: 'Thực hành 5 Lễ Khiêm Cung dọc theo bậc thang tháp ngược để hóa giải tâm Ngã Mạn.',
      requiredActions: 5,
      reflectionPrompt:
        'Cái bẫy tinh vi nhất của người có chút tài năng hoặc công đức tu tập là gì, và làm sao để vượt qua?',
      choices: [
        {
          text: 'Đó là tâm Ngã Mạn (tự cao); vượt qua bằng cách quán chiếu Vô Ngã, luôn khiêm cung học hỏi và tôn kính Phật tính nơi mọi người.',
          isAwakened: true,
          karmaRestored: 2100,
          feedback:
            'Ngọn tháp đảo ngược xoay chiều trở lại mặt đất bình an! Hạnh Khiêm Cung như Bồ Tát Thường Bất Khinh đã mở lối giải thoát.',
        },
        {
          text: 'Cố gắng chứng tỏ mình giỏi hơn tất cả mọi người để không ai dám xem thường.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Càng cố nâng cái Ta lên cao, ngọn tháp Kiêu Mạn càng giam chặt bạn trong sự cô độc.',
        },
        {
          text: 'Xem thường những người mới tu học vì họ chưa có nhiều công đức bằng mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Chấp vào công đức để khinh người thì công đức ấy đã hóa thành ma chướng Ngã Mạn.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 13,
    codeName: 'dai_pha_hoai',
    vietnameseName: 'Địa Ngục Đài Phá Hoại',
    englishSubtitle: 'Shattered Sanctuary of Sabotage',
    karmaThreshold: -2300,
    themeSin: 'Phá hoại sự thanh tịnh chung, gây chia rẽ đoàn thể (Phá hòa hợp Tăng / cộng đồng)',
    environmentDescription:
      'Không gian đổ nát với những mảnh cầu gãy, tháp đá vỡ vụn và kinh văn rách nát trôi lơ lửng trong bão tro tàn. Nơi phản chiếu nghiệp lực của những kẻ cố tình phá hủy nơi tu tập và gieo rắc bất hòa.',
    architectureStyle: 'Quần thể tháp đá cổ bị vỡ thành từng mảnh lơ lửng giữa cơn lốc tro xám',
    colorPalette: {
      primary: '#451a03',
      secondary: '#92400e',
      fogColor: '#1c0a00',
      ambientLight: '#d97706',
      accentGlow: '#fcd34d',
    },
    ambientSoundProfile: 'ruined_city',
    wardenNpc: {
      name: 'Ngục Chủ Tàn Viên',
      title: 'Giám Ngục Tầng Mười Ba — Đài Phá Hoại',
      dialogueIntro:
        'Dựng một ngôi chùa, kết một tình thân phải mất trăm năm; nhưng một lời chia rẽ, một tay phá hoại chỉ trong chốc lát đã biến tất cả thành tro bụi. Nay đứng giữa đống đổ nát này, ngươi có xót xa?',
      dialogueRedemption:
        'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao. Hòa hợp chính là sức mạnh nuôi dưỡng đạo mạch.',
    },
    punishmentMechanic:
      'Gió lốc tro tàn cuốn bay các mảnh đá; hành giả phải thu thập và ghép lại Tháp Hòa Hợp.',
    challengeType: 'rebuild_sanctuary',
    redemptionQuest: {
      title: 'Kiến Tạo Tháp Hòa Hợp',
      objective: 'Thu thập và gắn kết 5 Viên Đá Lục Hòa để khôi phục ngôi bảo tháp bị tàn phá.',
      requiredActions: 5,
      reflectionPrompt:
        'Trong một cộng đồng tu học hay xã hội, hành động nào tạo nên phước báu bền vững nhất?',
      choices: [
        {
          text: 'Thực hành tinh thần Lục Hòa (cùng nhau hòa hợp về thân, khẩu, ý, giới luật, tri kiến và lợi ích), vun đắp tình đoàn kết và bảo vệ chốn thanh tịnh.',
          isAwakened: true,
          karmaRestored: 2300,
          feedback:
            'Bảo tháp Hòa Hợp tỏa sáng rực rỡ! Sự đoàn kết và hộ trì chánh pháp đã xóa tan nghiệp phá hoại.',
        },
        {
          text: 'Lập bè kết phái để loại trừ những người không cùng ý kiến với mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Chia bè kết phái chính là nhân làm sụp đổ sự hòa hợp của đại chúng.',
        },
        {
          text: 'Phá hỏng công sức của tập thể nếu bản thân không được làm người đứng đầu.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Tâm ích kỷ và phá hoại vẫn giữ bạn lại giữa đống tro tàn của tầng ngục thứ 13.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 14,
    codeName: 'dam_duc_vong',
    vietnameseName: 'Địa Ngục Đầm Dục Vọng',
    englishSubtitle: 'Miasma Mire of Blind Craving',
    karmaThreshold: -2550,
    themeSin: 'Đắm chìm trong ái dục mù quáng, tà hạnh làm tan vỡ gia đạo và tổn thương người khác',
    environmentDescription:
      'Đầm lầy bùn đen tím bao phủ bởi làn sương hương mê hoặc nhưng ngạt thở. Những đóa hoa ảo ảnh rực rỡ mọc trên bùn lầy, ai bước tới hái đều bị lún sâu vào vũng lầy vô tận.',
    architectureStyle: 'Đầm lầy sương tím với những đình đài mục nát và hồ bùn chờ hạt sen thanh tịnh',
    colorPalette: {
      primary: '#3b0764',
      secondary: '#86198f',
      fogColor: '#1e0338',
      ambientLight: '#c084fc',
      accentGlow: '#f472b6',
    },
    ambientSoundProfile: 'swamp_miasma',
    wardenNpc: {
      name: 'Ngục Chủ Trầm Luân',
      title: 'Giám Ngục Tầng Mười Bốn — Đầm Dục Vọng',
      dialogueIntro:
        'Ái dục bất chính như mật ngọt dính trên lưỡi dao sắc; chỉ vì một phút buông thả mà làm tan nát nghĩa tình, khiến bao người rơi lệ. Ngươi còn muốn chìm trong đầm bùn này sao?',
      dialogueRedemption:
        'Gần bùn mà chẳng hôi tanh mùi bùn. Khi tâm tỉnh giác và chung thủy, hoa sen trắng liền nở giữa đầm sâu.',
    },
    punishmentMechanic:
      'Sương mù mê hoặc làm mờ tầm nhìn; hành giả phải gieo hạt sen tịnh giới để thanh lọc vùng nước đầm lầy.',
    challengeType: 'lotus_purity',
    redemptionQuest: {
      title: 'Ươm Mầm Bạch Liên Giữa Đầm Sâu',
      objective: 'Gieo và chăm sóc 5 Đóa Bạch Liên Tịnh Giới nở rộ giữa đầm lầy.',
      requiredActions: 5,
      reflectionPrompt:
        'Hình ảnh hoa sen mọc từ bùn lầy nhưng vươn lên tinh khiết nhắc nhở người tu học điều gì về việc đối diện với cám dỗ?',
      choices: [
        {
          text: 'Sống giữa cuộc đời nhưng giữ tâm chánh niệm, tôn trọng tình nghĩa chung thủy và làm chủ các giác quan trước cám dỗ bất chính.',
          isAwakened: true,
          karmaRestored: 2550,
          feedback:
            'Năm đóa bạch liên nở rộ tỏa hương thanh khiết, hóa giải toàn bộ chướng khí đầm lầy!',
        },
        {
          text: 'Chạy theo mọi khoái lạc nhất thời của giác quan bất chấp hậu quả đối với người thân.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Buông thả theo dục vọng mù quáng chỉ khiến đôi chân lún sâu hơn vào Đầm Dục Vọng.',
        },
        {
          text: 'Đổ lỗi cho hoàn cảnh và sự cám dỗ bên ngoài chứ không chịu làm chủ tâm mình.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Cảnh bên ngoài chỉ là duyên, tâm thiếu chánh niệm mới là nhân dẫn đến sa ngã.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 15,
    codeName: 'can_lam_quyen',
    vietnameseName: 'Địa Ngục Cân Lạm Quyền',
    englishSubtitle: 'Iron Court of Abused Authority',
    karmaThreshold: -2800,
    themeSin: 'Lạm dụng quyền lực và địa vị để áp bức dân lành, đổi trắng thay đen, xử ép người vô tội',
    environmentDescription:
      'Pháp trường ngầm khổng lồ bằng đá hoa cương đen với Cán Cân Công Lý bằng đồng cao chạm vòm hang. Kẻ từng dùng quyền thế chà đạp công lý nay phải đứng trên đĩa cân chịu sức nặng của vạn tiếng oan khiên.',
    architectureStyle: 'Công đường đá đen uy nghiêm với Cán Cân Đồng khổng lồ và các trụ luật nhân quả',
    colorPalette: {
      primary: '#1f2937',
      secondary: '#b45309',
      fogColor: '#111827',
      ambientLight: '#f59e0b',
      accentGlow: '#fde68a',
    },
    ambientSoundProfile: 'judgment_scale',
    wardenNpc: {
      name: 'Ngục Chủ Thiết Bình',
      title: 'Giám Ngục Tầng Mười Lăm — Cân Lạm Quyền',
      dialogueIntro:
        'Ở dương gian, ngươi nắm quyền sinh sát liền tưởng mình đứng trên luật pháp. Nhưng Cân Nhân Quả của đất trời không nhận hối lộ, cũng chẳng sợ quyền uy. Ngươi đã thấy sức nặng của những giọt nước mắt dân lành chưa?',
      dialogueRedemption:
        'Quyền lực chân chính không dùng để cai trị hay ức hiếp, mà là trách nhiệm bảo hộ và phụng sự muôn dân.',
    },
    punishmentMechanic:
      'Mặt sàn công đường nghiêng lệch theo độ lệch của Cán Cân; hành giả phải đặt các Quả Cân Công Minh để lập lại thăng bằng.',
    challengeType: 'scales_of_justice',
    redemptionQuest: {
      title: 'Cân Bằng Cán Cân Công Chính',
      objective: 'Thực hành hoàn trả công lý tại 5 Trụ Cân Nhân Quả để đưa Cán Cân Đồng về vị trí thăng bằng.',
      requiredActions: 5,
      reflectionPrompt:
        'Khi một người được trao quyền hạn hoặc địa vị cao trong xã hội, tâm niệm nào giúp họ tạo phước thay vì tạo nghiệp?',
      choices: [
        {
          text: 'Xem địa vị là cơ hội phụng sự, luôn lắng nghe tiếng nói của người yếu thế, hành xử công minh và lấy Từ Bi làm gốc.',
          isAwakened: true,
          karmaRestored: 2800,
          feedback:
            'Cán Cân Đồng trở về vị trí cân bằng tuyệt đối! Đạo của bậc thiện tri thức và người lãnh đạo chân chính đã sáng tỏ.',
        },
        {
          text: 'Dùng quyền lực để thu vén lợi ích cho phe nhóm của mình và trừng phạt người nói thẳng.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đĩa cân lập tức nghiêng lệch dữ dội. Lạm quyền vì tư lợi là trọng nghiệp khó dung.',
        },
        {
          text: 'Bắt kẻ dưới phải phục tùng tuyệt đối mọi mệnh lệnh bất kể đúng sai.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Quyền uy thiếu đạo đức chỉ gieo rắc oán hận. Chưa thể rời khỏi Cân Lạm Quyền.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 16,
    codeName: 'suong_vo_minh',
    vietnameseName: 'Địa Ngục Sương Vô Minh',
    englishSubtitle: 'Abyssal Fog of Willful Ignorance',
    karmaThreshold: -3050,
    themeSin: 'Tà kiến cố chấp, phủ nhận luật Nhân Quả, truyền bá điều mê muội dẫn dắt người khác làm ác',
    environmentDescription:
      'Biển sương mù đen đặc không thấy mặt trời cũng chẳng thấy trăng sao. La bàn quay cuồng vô định, phản chiếu tâm thức của những kẻ cố tình nhắm mắt trước sự thật Nhân Quả và dẫn người khác vào đường tối.',
    architectureStyle: 'Đài quan tinh cổ đổ nát chìm trong biển sương đen và những trụ đèn Bát Nhã tắt lửa',
    colorPalette: {
      primary: '#18181b',
      secondary: '#4b5563',
      fogColor: '#09090b',
      ambientLight: '#9ca3af',
      accentGlow: '#fef08a',
    },
    ambientSoundProfile: 'endless_fog',
    wardenNpc: {
      name: 'Ngục Chủ Mê Đồ',
      title: 'Giám Ngục Tầng Mười Sáu — Sương Vô Minh',
      dialogueIntro:
        'Người không biết mà lầm lỗi còn dễ chỉ đường; kẻ cố tình che mắt mình rồi bảo rằng "làm ác chẳng có quả báo" thì tự biến mình thành người mù đi trong đêm tối. Ngươi muốn mãi đi trong sương đen hay muốn thắp đèn Trí Tuệ?',
      dialogueRedemption:
        'Một ngọn đèn thắp lên, bóng tối ngàn năm liền tan biến. Chánh Kiến chính là đôi mắt dẫn đường trên vạn nẻo luân hồi.',
    },
    punishmentMechanic:
      'Tầm nhìn thu hẹp trong sương mù Vô Minh; hành giả phải thắp sáng từng Ngọn Đèn Tuệ Giác để mở rộng vùng sáng.',
    challengeType: 'lamp_of_wisdom',
    redemptionQuest: {
      title: 'Thắp Đèn Tuệ Giác Xua Tan Vô Minh',
      objective: 'Thắp sáng 5 Ngọn Đèn Tuệ Giác bằng sự quán chiếu lý Nhân Quả và Duyên Khởi.',
      requiredActions: 5,
      reflectionPrompt:
        'Vì sao Chánh Kiến (hiểu biết đúng đắn về Tứ Diệu Đế và Nhân Quả) lại đứng đầu trong Bát Chánh Đạo?',
      choices: [
        {
          text: 'Vì Chánh Kiến như ngọn đuốc soi đường: hiểu rõ thiện ác có quả báo, vạn vật do duyên sinh giúp ta tự giác làm lành, lánh dữ và không mê tín hay cố chấp.',
          isAwakened: true,
          karmaRestored: 3050,
          feedback:
            'Năm ngọn đèn Bát Nhã bừng sáng đẩy lùi biển sương mù Vô Minh! Ánh sáng Chánh Kiến đã khai mở.',
        },
        {
          text: 'Cho rằng chết là hết, làm thiện hay làm ác đều chỉ là ngẫu nhiên không có nhân quả.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đó là đoạn kiến phủ nhận nhân quả, khiến sương mù Vô Minh càng thêm dày đặc.',
        },
        {
          text: 'Mù quáng tin rằng chỉ cần cầu xin thần linh ban phước là có thể xóa hết tội lỗi mà không cần sửa đổi hành vi.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Đức Phật dạy không ai có thể gánh thay nghiệp hay rửa sạch tội lỗi nếu bản thân không tự chuyển hóa tâm hạnh.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 17,
    codeName: 'xieng_chap_niem',
    vietnameseName: 'Địa Ngục Xiềng Chấp Niệm',
    englishSubtitle: 'Shadow Prison of Obsessive Grudges',
    karmaThreshold: -3300,
    themeSin: 'Chấp niệm oán thù sâu nặng, thề nguyền báo oán đời đời kiếp kiếp, tự khóa tâm trong hận thù',
    environmentDescription:
      'Những vòng lao ngục sắt đen đồng tâm được quấn quanh bởi xiềng xích ánh sáng tím sẫm của ký ức đau thương. Điều kỳ lạ nhất là cửa ngục đều có chốt mở từ bên trong — tội nhân bị giam chỉ vì họ nhất quyết không chịu buông tay khỏi sợi xích oán thù.',
    architectureStyle: 'Lao ngục vòng tròn đồng tâm với những sợi xích ký ức phát sáng tím thẫm',
    colorPalette: {
      primary: '#2e1065',
      secondary: '#6d28d9',
      fogColor: '#170536',
      ambientLight: '#a78bfa',
      accentGlow: '#ddd6fe',
    },
    ambientSoundProfile: 'shadow_chains',
    wardenNpc: {
      name: 'Ngục Chủ Tâm Lao',
      title: 'Giám Ngục Tầng Mười Bảy — Xiềng Chấp Niệm',
      dialogueIntro:
        'Hãy nhìn kỹ xem: cửa ngục này không hề khóa từ bên ngoài! Chính hai bàn tay ngươi đang nắm chặt sợi xích oán hận quá khứ không chịu buông. Ngươi định ôm cục than hồng ấy để tự đốt mình đến bao giờ?',
      dialogueRedemption:
        'Buông xả không phải là yếu đuối, mà là trả lại tự do cho chính tâm hồn mình. Quá khứ đã qua, hiện tại đã sáng.',
    },
    punishmentMechanic:
      'Các sợi xích ký ức kéo ngược hành giả về trung tâm lao ngục cho đến khi hành giả chủ động mở 5 Chốt Khóa Buông Xả từ bên trong.',
    challengeType: 'sever_attachment',
    redemptionQuest: {
      title: 'Mở Khóa Tâm Lao — Thực Hành Xả Ly',
      objective: 'Chủ động mở 5 Chốt Khóa Nội Tâm bằng sự tha thứ và buông bỏ chấp niệm quá khứ.',
      requiredActions: 5,
      reflectionPrompt:
        'Khi một người cứ mãi ôm giữ nỗi hận thù và ám ảnh về lỗi lầm của người khác trong quá khứ, ai là người đang chịu khổ đau nhiều nhất?',
      choices: [
        {
          text: 'Chính người ôm giữ hận thù đang tự giam mình trong ngục tối; chỉ khi thực hành Tha Thứ và Buông Xả (Xả tâm — Upekkhā), tâm mới thực sự giải thoát.',
          isAwakened: true,
          karmaRestored: 3300,
          feedback:
            'Cửa ngục Tâm Lao mở toang, xiềng xích tím hóa thành cánh bướm ánh sáng bay về trời!',
        },
        {
          text: 'Phải ghi nhớ mối thù này suốt đời và truyền lại để tìm cách bắt đối phương trả giá gấp mười lần.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Nắm chặt sợi xích báo oán chính là tự khóa cửa ngục từ bên trong.',
        },
        {
          text: 'Tự dằn vặt và chìm đắm mãi trong những chuyện đã qua không thể thay đổi.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Quá khứ đã qua không thể níu kéo; hãy quay về giây phút hiện tại để chuyển hóa.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
  {
    level: 18,
    codeName: 'vo_gian',
    vietnameseName: 'Địa Ngục Vô Gián',
    englishSubtitle: 'Avīci — The Uninterrupted Void',
    karmaThreshold: -3500,
    themeSin: 'Cực ác vô đạo, cố ý gây đại họa cho muôn loài mà hoàn toàn đánh mất lương tri và lòng hổ thẹn',
    environmentDescription:
      'Không gian vô tận đen thẫm pha sắc đỏ sẫm tĩnh mịch, nơi thời gian và nỗi cô độc tưởng chừng không có kẽ hở (Vô Gián). Thế nhưng ngay giữa tâm điểm vực thẳm tối tăm nhất vẫn sừng sững một cây Tích Trượng vàng rực rỡ và viên Minh Châu chiếu sáng — biểu tượng đại nguyện của Địa Tạng Vương Bồ Tát: "Địa ngục vị không, thệ bất thành Phật."',
    architectureStyle: 'Hư không hắc ngọc bất tận với Đài Tích Trượng Kim Quang và Minh Châu Bồ Đề ở trung tâm',
    colorPalette: {
      primary: '#1a0505',
      secondary: '#450a0a',
      fogColor: '#0a0202',
      ambientLight: '#991b1b',
      accentGlow: '#fbbf24',
    },
    ambientSoundProfile: 'avici_void',
    wardenNpc: {
      name: 'Hộ Pháp Minh Châu (Hóa Thân Cửa Vô Gián)',
      title: 'Thủ Hộ Tầng Mười Tám — Địa Ngục Vô Gián (Avīci)',
      dialogueIntro:
        'Đây là tầng sâu nhất của U Minh — Vô Gián Địa Ngục. Nhưng hãy nhìn viên Minh Châu trước mặt: trong giáo lý nhà Phật, không có địa ngục nào là vĩnh viễn, và không có chúng sinh nào mất hẳn Phật tính. Dù tội nặng như núi Tu Di, một niệm chí thành sám hối cũng có thể làm điểm tựa quay đầu. Ngươi đã sẵn sàng thức tỉnh chưa?',
      dialogueRedemption:
        'Biển khổ mênh mông, quay đầu là bờ! Một niệm giác ngộ phá tan vạn kiếp vô minh. Hãy mang tâm Bồ Đề đã thức tỉnh hôm nay trở về nhân gian làm lợi lạc cho muôn loài.',
    },
    punishmentMechanic:
      'Bóng tối Vô Gián bao phủ bốn bề; hành giả phải hướng về ánh sáng Tích Trượng và hoàn thành 6 bước Chí Tâm Sám Hối để đánh thức Phật tính.',
    challengeType: 'avici_awakening',
    redemptionQuest: {
      title: 'Ánh Sáng Minh Châu Nơi Vực Thẳm — Chí Tâm Sám Hối',
      objective: 'Thực hành 6 Bước Chí Tâm Sám Hối và Phát Nguyện Hướng Thiện dưới ánh sáng Minh Châu.',
      requiredActions: 6,
      reflectionPrompt:
        'Ngay cả khi một người đã rơi xuống vực sâu nhất của lầm lỗi, chân lý nào của Phật pháp vẫn mở ra con đường tái sinh và hướng thiện?',
      choices: [
        {
          text: 'Mọi pháp đều Vô Thường và mọi chúng sinh đều có khả năng giác ngộ; khi biết hổ thẹn (Tàm - Quý), chí thành sám hối và phát nguyện làm lành, nghiệp ác dần chuyển hóa và cửa giải thoát luôn rộng mở.',
          isAwakened: true,
          karmaRestored: 3500,
          feedback:
            'Ánh sáng vàng kim của Minh Châu và Tích Trượng bừng nở khắp hư không! Vô Gián Địa Ngục hóa thành đài sen thanh tịnh đưa bạn trở về Phàm Giới.',
        },
        {
          text: 'Tuyệt vọng buông xuôi vì nghĩ mình đã phạm quá nhiều lỗi lầm nên tiếp tục làm ác tới cùng.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Tự hủy hoại và từ bỏ thiện tâm chính là sợi dây giữ chặt tâm thức trong Vô Gián. Đừng bao giờ từ bỏ khả năng hướng thiện!',
        },
        {
          text: 'Oán trách trời đất bất công mà không chịu nhìn lại nhân quả do chính mình đã gieo.',
          isAwakened: false,
          karmaRestored: 0,
          feedback:
            'Khi chưa nhận trách nhiệm về tâm ý và hành động của mình, ánh sáng giác ngộ chưa thể hiển lộ.',
        },
      ],
    },
    exitKarmaBalance: 0,
  },
];

/**
 * THE WISDOM LIBRARY (THƯ VIỆN TRÍ TUỆ — 10 CORE TOPICS)
 * Explicitly cites authentic Nikāya/Āgama and Mahāyāna scriptural sources.
 * Includes interactive moral dilemmas with compassionate, neutral, and harmful choices
 * so players can either cultivate Merit (Công Đức) or accumulate Negative Karma (Nghiệp Lực)
 * to experience the Underworld Judgment and Redemption mechanics.
 */
export const WISDOM_LIBRARY: WisdomEntry[] = [
  {
    id: 'wisdom_four_noble_truths',
    title: 'Tứ Diệu Đế: Bốn Sự Thật Cao Quý Giải Thoát Khổ Đau',
    category: 'four_noble_truths',
    traditionNote: 'Giáo lý nền tảng chung của Phật giáo Nguyên Thủy (Nikāya/Āgama) và Phật giáo Đại Thừa (Mahāyāna)',
    summaryStory:
      'Tại vườn Lộc Uyển (Isipatana), Đức Phật giảng bài pháp đầu tiên ví mình như vị lương y chẩn đoán bệnh cho thế gian: (1) Khổ Đế là nhận diện thẳng thắn những bất như ý của đời sống; (2) Tập Đế là chỉ rõ nguyên nhân của khổ nằm ở lòng tham ái và chấp trước; (3) Diệt Đế khẳng định trạng thái an tịnh, hết khổ là có thật khi buông bỏ tham ái; và (4) Đạo Đế là phương thuốc Bát Chánh Đạo đưa đến an vui. Nhìn thẳng vào khổ đau không phải để bi quan, mà để chữa lành từ gốc rễ.',
    sourceCitation:
      'Kinh Chuyển Pháp Luân (Dhammacakkappavattana Sutta, Tương Ưng Bộ Kinh — SN 56.11)',
    dilemmaScenario: {
      npcName: 'Lão Nông Trần Công',
      situation:
        'Mùa màng của Lão Nông Trần Công vừa bị mưa bão cuốn trôi một nửa. Ông đang đứng bên ruộng lúa ngập nước, vừa tuyệt vọng vừa muốn vay nặng lãi hoặc chiếm đất bờ kênh của hàng xóm để gỡ gạc.',
      choices: [
        {
          id: 'fnt_compassionate',
          label: 'An ủi ông bình tĩnh nhận diện khó khăn, tặng giống lúa mới và cùng bà con khơi thông dòng nước.',
          alignment: 'compassionate',
          meritDelta: 45,
          negativeKarmaDelta: 0,
          expDelta: 60,
          consequenceText:
            'Lão nông nguôi cơn tuyệt vọng, giữ được tình làng nghĩa xóm và cùng bạn khôi phục lại ruộng đồng.',
          teachingExplanation:
            'Nhận diện đúng nguyên nhân của khổ và dùng hành động chân chánh để tháo gỡ chính là ứng dụng Tứ Diệu Đế vào đời sống.',
        },
        {
          id: 'fnt_neutral',
          label: 'Khuyên ông cố gắng chịu đựng rồi cáo từ tiếp tục hành trình của mình.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Lời khuyên tuy không hại ai nhưng chưa đủ sức giúp lão nông vượt qua cơn ngặt nghèo.',
          teachingExplanation:
            'Thấy khổ mà chỉ dừng ở lời nói xã giao thì chưa khởi được năng lượng chuyển hóa thiết thực.',
        },
        {
          id: 'fnt_harmful',
          label: 'Xúi ông lén phá bờ đê xả nước ngập sang ruộng nhà bên cạnh để cứu ruộng của mình và chia phần cho bạn.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 150,
          expDelta: 10,
          consequenceText:
            'Ruộng nhà hàng xóm mất trắng, cả xóm lâm vào cảnh tranh chấp và oán hận nặng nề.',
          teachingExplanation:
            'Vì tham ái ích kỷ (Tập Đế) mà đẩy nỗi khổ sang người khác chỉ làm nhân rộng vòng xoáy khổ đau và tạo ác nghiệp.',
        },
      ],
    },
    reflectionQuestion:
      'Khi gặp một việc bất như ý trong cuộc sống, bạn thường oán trách hoàn cảnh hay bình tĩnh tìm hiểu nguyên nhân gốc rễ trong tâm mình?',
  },
  {
    id: 'wisdom_eightfold_path',
    title: 'Bát Chánh Đạo: Tám Nhánh Đường Trung Đạo',
    category: 'eightfold_path',
    traditionNote: 'Giáo lý cốt tủy của Phật giáo Nguyên Thủy và Đại Thừa (Tam Vô Lậu Học: Giới – Định – Tuệ)',
    summaryStory:
      'Đức Phật ví người tu học như người lên dây đàn: nếu dây căng quá thì đứt (khổ hạnh cực đoan), nếu chùng quá thì không thành tiếng (buông thả hưởng thụ). Con đường Trung Đạo gồm 8 chi phần nâng đỡ lẫn nhau: Chánh Kiến, Chánh Tư Duy (thuộc Tuệ); Chánh Ngữ, Chánh Nghiệp, Chánh Mạng (thuộc Giới); và Chánh Tinh Tấn, Chánh Niệm, Chánh Định (thuộc Định).',
    sourceCitation:
      'Kinh Phân Tích Đạo (Magga-Vibhaṅga Sutta, SN 45.8) & Kinh Sona (AN 6.55 — Ví dụ dây đàn)',
    dilemmaScenario: {
      npcName: 'Thương Nhân Bạch Lộc',
      situation:
        'Thương nhân Bạch Lộc mời bạn hợp tác buôn dược liệu. Ông tiết lộ có một lô thảo dược bị ẩm mốc nhưng nếu sấy khô tẩm hương liệu giả làm thuốc quý thì sẽ thu lời gấp mười lần.',
      choices: [
        {
          id: 'efp_compassionate',
          label: 'Kiên quyết từ chối làm thuốc giả, khuyên ông hủy phần mốc và chỉ bán dược liệu thật đúng giá trị.',
          alignment: 'compassionate',
          meritDelta: 50,
          negativeKarmaDelta: 0,
          expDelta: 65,
          consequenceText:
            'Bạch Lộc tỉnh ngộ, giữ được uy tín lâu dài và cứu nhiều bệnh nhân khỏi dùng nhầm thuốc hỏng.',
          teachingExplanation:
            'Thực hành Chánh Ngữ, Chánh Nghiệp và Chánh Mạng (nuôi mạng sống bằng nghề nghiệp chân chính, không lừa dối hại người).',
        },
        {
          id: 'efp_neutral',
          label: 'Rút lui khỏi thương vụ nhưng không khuyên can vì ngại mất lòng ông ta.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Bạn giữ được tay mình sạch sẽ nhưng những người bệnh trong vùng vẫn có nguy cơ mua phải thuốc kém chất lượng.',
          teachingExplanation:
            'Giữ mình không làm ác là bước đầu, nhưng mở lời khuyên thiện đúng lúc mới trọn vẹn Chánh Tinh Tấn.',
        },
        {
          id: 'efp_harmful',
          label: 'Đồng ý trộn hương liệu bán giá cắt cổ cho người bệnh nghèo để chia nhau khoản lợi nhuận khổng lồ.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 180,
          expDelta: 10,
          consequenceText:
            'Nhiều người bệnh uống phải thuốc giả khiến bệnh tình trầm trọng hơn; tiếng oán than vang thấu Nghiệp Kính Đài.',
          teachingExplanation:
            'Tà Mạng và Tà Nghiệp (kiếm sống trên nỗi đau và sự lừa dối người khác) tạo ra ác nghiệp rất nặng.',
        },
      ],
    },
    reflectionQuestion:
      'Trong công việc và lời nói hàng ngày, làm thế nào để ta vừa đạt hiệu quả vừa không làm tổn hại đến bất kỳ ai?',
  },
  {
    id: 'wisdom_five_precepts',
    title: 'Ngũ Giới: Năm Món Quà Bình An Cho Muôn Loài',
    category: 'five_precepts',
    traditionNote: 'Giới luật căn bản của người cư sĩ Phật tử trong cả truyền thống Nam Tông và Bắc Tông',
    summaryStory:
      'Nhiều người lầm tưởng giữ Ngũ Giới (Không sát sinh, Không trộm cắp, Không tà hạnh, Không nói dối, Không say sưa nghiện ngập) là tự trói buộc mình. Nhưng trong Kinh Dòng Phước Lành, Đức Phật dạy rằng người giữ năm giới thực chất đang trao tặng "món quà vô úy" (không sợ hãi) và sự an toàn vô lượng cho tất cả chúng sinh xung quanh.',
    sourceCitation:
      'Kinh Dòng Phước Lành (Abhisanda Sutta, Tăng Chi Bộ Kinh — AN 8.39)',
    dilemmaScenario: {
      npcName: 'Thợ Săn Trẻ A Tùng',
      situation:
        'Bên bìa rừng trúc sau chùa, A Tùng vừa bắt được một con nai mẹ đang mang thai. Anh đang phân vân giữa việc đem bán lấy tiền uống rượu hay thả nó về rừng.',
      choices: [
        {
          id: 'fp_compassionate',
          label: 'Lấy lương khô và tiền công đức hỗ trợ A Tùng, đồng thời thuyết phục anh mở lưới phóng sinh nai mẹ.',
          alignment: 'compassionate',
          meritDelta: 50,
          negativeKarmaDelta: 0,
          expDelta: 70,
          consequenceText:
            'Nai mẹ cúi đầu cảm tạ rồi chạy về rừng; A Tùng xúc động quyết định chuyển sang nghề trồng thảo dược.',
          teachingExplanation:
            'Giữ giới Không Sát Sinh và thực hành hạnh Phóng Sinh bảo hộ sự sống đúng tinh thần Từ Bi trí tuệ.',
        },
        {
          id: 'fp_neutral',
          label: 'Đứng nhìn từ xa, thầm chúc con nai may mắn rồi đi tiếp.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Sự lưỡng lự khiến cơ hội cứu giúp trôi qua trong tiếc nuối.',
          teachingExplanation:
            'Tâm lành cần đi đôi với hành động thiết thực mới kết thành quả lành trọn vẹn.',
        },
        {
          id: 'fp_harmful',
          label: 'Xúi A Tùng giết ngay con nai để cùng mở tiệc rượu linh đình ngay sát cổng chùa.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 200,
          expDelta: 10,
          consequenceText:
            'Hai mạng sống bị tước đoạt trong tiếng kêu bi thương, làm ô uế sự thanh tịnh của chốn già lam.',
          teachingExplanation:
            'Phạm cùng lúc giới Sát Sinh và giới Uống Rượu say sưa làm tổn giảm phước đức nghiêm trọng.',
        },
      ],
    },
    reflectionQuestion:
      'Khi nhìn Ngũ Giới như năm bức tường bảo vệ hạnh phúc gia đình và xã hội thay vì những điều cấm đoán, bạn cảm thấy điều gì thay đổi?',
  },
  {
    id: 'wisdom_compassion',
    title: 'Từ Bi: Tâm Thương Yêu Không Biên Giới',
    category: 'compassion',
    traditionNote: 'Kinh Từ Bi (Nikāya) & Hạnh nguyện Bồ Tát Quán Thế Âm trong Phật giáo Đại Thừa',
    summaryStory:
      '"Từ" (Mettā) là đem lại niềm vui và mong muôn loài được an lạc; "Bi" (Karuṇā) là lắng nghe tiếng kêu khổ đau của thế gian để dang tay cứu giúp. Như mẹ hiền thương yêu và che chở đứa con duy nhất của mình bằng cả mạng sống, người tu tập mở rộng lòng từ ái không phân biệt thân sơ, cao thấp.',
    sourceCitation:
      'Kinh Từ Bi (Karaniya Mettā Sutta, Kinh Tập — Sutta Nipāta 1.8) & Kinh Pháp Hoa Phẩm Phổ Môn',
    dilemmaScenario: {
      npcName: 'Bé Gái Lạc Đường Tiểu Liên',
      situation:
        'Giữa cơn mưa chiều nơi sân chùa, Tiểu Liên bị lạc gia đình, vừa đói lạnh vừa hoảng sợ khóc nức nở bên hiên Tam Bảo.',
      choices: [
        {
          id: 'comp_compassionate',
          label: 'Nhường áo ấm và phần cháo chay của mình cho bé, rồi cùng Sư Cô thông báo tìm cha mẹ cho em.',
          alignment: 'compassionate',
          meritDelta: 45,
          negativeKarmaDelta: 0,
          expDelta: 60,
          consequenceText:
            'Cha mẹ Tiểu Liên tìm thấy con trong niềm hạnh phúc vỡ òa, cả gia đình chắp tay cảm tạ ân đức của bạn.',
          teachingExplanation:
            'Lắng nghe và xoa dịu nỗi sợ hãi của người đang yếu thế chính là hiện thân sống động của tâm Từ Bi.',
        },
        {
          id: 'comp_neutral',
          label: 'Chỉ tay về phía nhà khách của chùa rồi vội vã đi làm nhiệm vụ riêng.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Bé gái vẫn còn run rẩy một lúc lâu mới được người khác phát hiện và giúp đỡ.',
          teachingExplanation:
            'Sự giúp đỡ nửa vời tuy không xấu nhưng thiếu đi hơi ấm của sự đồng cảm sâu sắc.',
        },
        {
          id: 'comp_harmful',
          label: 'Quát mắng đuổi đứa bé đi chỗ khác vì tiếng khóc làm ồn buổi tụng kinh của mình.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 140,
          expDelta: 10,
          consequenceText:
            'Đứa bé hoảng loạn chạy vào màn mưa lạnh; buổi tụng kinh của bạn chỉ còn là âm thanh rỗng tuếch không chút công đức.',
          teachingExplanation:
            'Tu hình tướng mà tâm lạnh lùng vô cảm, quát nạt người cô thế thì xa rời hoàn toàn tinh thần Phật đạo.',
        },
      ],
    },
    reflectionQuestion:
      'Đã bao giờ bạn vì quá bận rộn với mục tiêu cá nhân mà vô tình lướt qua một người đang rất cần sự lắng nghe ngay bên cạnh?',
  },
  {
    id: 'wisdom_forgiveness',
    title: 'Bao Dung & Xả Hận: Lấy Ân Báo Oán, Oán Tiêu Tan',
    category: 'forgiveness',
    traditionNote: 'Giáo lý Kinh Pháp Cú (Dhammapada) và Kinh Ví Dụ Cái Cưa (Trung Bộ Kinh)',
    summaryStory:
      'Trong Kinh Pháp Cú, Đức Phật dạy một định luật vĩnh cửu: "Với hận diệt hận thù, đời này không có được; không hận diệt hận thù, là định luật ngàn thu." Giận dữ và trả thù giống như tự tay cầm than đỏ ném vào người khác — người chưa chắc đã trúng, nhưng bàn tay mình đã bỏng rát trước tiên.',
    sourceCitation:
      'Kinh Pháp Cú (Dhammapada, kệ số 5 — Phẩm Song Yếu) & Kinh Ví Dụ Cái Cưa (Kakacūpama Sutta, MN 21)',
    dilemmaScenario: {
      npcName: 'Hành Giả Nóng Nảy Thiết Hổ',
      situation:
        'Do hiểu lầm bạn giành chỗ ngồi thiền, Thiết Hổ đã buông lời xúc phạm bạn trước mặt đại chúng. Hôm sau, khi biết mình trách lầm, anh ta ngập ngừng đứng trước mặt bạn với vẻ hối lỗi.',
      choices: [
        {
          id: 'forg_compassionate',
          label: 'Mỉm cười chắp tay tha thứ hoàn toàn, mời anh ấy cùng ngồi thiền và uống trà đàm đạo.',
          alignment: 'compassionate',
          meritDelta: 50,
          negativeKarmaDelta: 0,
          expDelta: 65,
          consequenceText:
            'Thiết Hổ cảm phục tấm lòng bao dung của bạn, từ kẻ đối đầu trở thành người bạn đồng tu chí cốt.',
          teachingExplanation:
            'Tha thứ không phải là nhu nhược, mà là sức mạnh của bậc trí giả biết cởi trói cho cả mình lẫn người.',
        },
        {
          id: 'forg_neutral',
          label: 'Gật đầu cho qua chuyện nhưng từ đó giữ khoảng cách lạnh nhạt, không bao giờ nói chuyện nữa.',
          alignment: 'neutral',
          meritDelta: 10,
          negativeKarmaDelta: 0,
          expDelta: 25,
          consequenceText:
            'Không còn xung đột bên ngoài nhưng giữa hai người vẫn tồn tại một bức tường ngăn cách vô hình.',
          teachingExplanation:
            'Không trả thù là tốt, nhưng buông bỏ luôn gợn sóng thành kiến trong lòng mới đạt đến sự thanh thản hoàn toàn.',
        },
        {
          id: 'forg_harmful',
          label: 'Nhân cơ hội này bêu xấu và làm nhục lại Thiết Hổ trước mặt mọi người cho bõ tức.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 150,
          expDelta: 10,
          consequenceText:
            'Thiết Hổ từ hối hận chuyển sang uất hận, mối bất hòa trong đạo tràng ngày càng sâu sắc.',
          teachingExplanation:
            'Lấy oán báo oán khiến oán thù chồng chất; đánh người đang biết lỗi là tự đánh mất công đức của mình.',
        },
      ],
    },
    reflectionQuestion:
      'Có nỗi giận hờn cũ nào bạn vẫn đang mang theo trong lòng không, và bạn có sẵn sàng buông nó xuống để tâm mình được nhẹ nhàng hôm nay?',
  },
  {
    id: 'wisdom_mindfulness',
    title: 'Chánh Niệm: Sống Trọn Vẹn Trong Giây Phút Hiện Tại',
    category: 'mindfulness',
    traditionNote: 'Kinh Niệm Xứ (Satipaṭṭhāna Sutta) & Kinh Nhất Dạ Hiền Giả (Trung Bộ Kinh)',
    summaryStory:
      '"Quá khứ không truy tìm, tương lai không ước vọng. Quá khứ đã đoạn tận, tương lai lại chưa đến. Chỉ có pháp hiện tại, tuệ quán chính ở đây." Chánh niệm (Sati) là năng lượng tỉnh thức giúp ta biết rõ từng hơi thở vào ra, từng bước chân và từng ý niệm đang khởi lên trong tâm mà không bị cuốn trôi.',
    sourceCitation:
      'Kinh Nhất Dạ Hiền Giả (Bhaddekaratta Sutta, MN 131) & Kinh Đại Niệm Xứ (DN 22 / MN 10)',
    dilemmaScenario: {
      npcName: 'Thư Sinh Tâm Loạn Minh Khang',
      situation:
        'Minh Khang đang chuẩn bị bước vào kỳ khảo hạch trọng đại nhưng tâm trí rối bời vì vừa hối tiếc thất bại năm ngoái, vừa sợ hãi kết quả ngày mai đến mức định dùng thuốc kích thích cấm.',
      choices: [
        {
          id: 'mind_compassionate',
          label: 'Hướng dẫn Minh Khang ngồi xuống thở chánh niệm 3 hơi sâu, buông quá khứ và tương lai để tập trung ôn luyện chân chính.',
          alignment: 'compassionate',
          meritDelta: 45,
          negativeKarmaDelta: 0,
          expDelta: 60,
          consequenceText:
            'Minh Khang lấy lại sự tĩnh tại, từ bỏ thuốc cấm và vượt qua kỳ khảo hạch bằng chính thực lực của mình.',
          teachingExplanation:
            'Chánh niệm đưa tâm từ sự tán loạn trở về định tĩnh, từ đó trí tuệ tự nhiên phát sinh (Giới sinh Định, Định sinh Tuệ).',
        },
        {
          id: 'mind_neutral',
          label: 'Bảo anh ta đừng nghĩ ngợi nữa rồi tự mình đi dạo quanh hồ sen.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Minh Khang vẫn loay hoay chưa biết cách làm lắng dịu tâm trí.',
          teachingExplanation:
            'Chỉ nói "đừng lo" mà không trao phương pháp quay về hơi thở hiện tại thì khó giúp người đang hoảng loạn.',
        },
        {
          id: 'mind_harmful',
          label: 'Bán cho anh ta bài thi gian lận và thuốc kích thích để kiếm lời trên sự hoang mang của người khác.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 160,
          expDelta: 10,
          consequenceText:
            'Minh Khang bị phát hiện gian lận và suy kiệt sức khỏe; bạn gánh lấy ác nghiệp trục lợi bất chính.',
          teachingExplanation:
            'Lợi dụng lúc người khác mất chánh niệm để dẫn dắt họ vào con đường gian dối là tạo nghiệp bất thiện.',
        },
      ],
    },
    reflectionQuestion:
      'Ngay lúc này, khi đang đọc những dòng chữ này, hơi thở của bạn đang nông hay sâu, và tâm bạn có đang thật sự ở đây không?',
  },
  {
    id: 'wisdom_impermanence',
    title: 'Vô Thường: Cánh Cửa Của Sự Chuyển Hóa Và Trân Quý',
    category: 'impermanence',
    traditionNote: 'Giáo lý Tam Pháp Ấn (Vô thường - Khổ - Vô ngã) trong toàn bộ kinh điển Phật giáo',
    summaryStory:
      'Câu chuyện nàng Kisāgotamī ôm đứa con đã mất đi tìm hạt cải ở một ngôi nhà "chưa từng có người qua đời" đã giúp nàng nhận ra quy luật Vô Thường (Anicca) chung của muôn loài. Hiểu Vô Thường không làm ta bi lụy; trái lại, vì mọi sự đều biến đổi nên nỗi khổ có thể qua đi, người lầm lỗi có thể trở thành bậc hiền, và mỗi phút giây bên người thân đều trở nên vô giá.',
    sourceCitation:
      'Kinh Đại Bát Niết Bàn (Mahāparinibbāna Sutta, DN 16) & Chú Giải Kinh Pháp Cú tích truyện Kisāgotamī (DhpA 8.13)',
    dilemmaScenario: {
      npcName: 'Nghệ Nhân Gốm Sứ Cụ Tâm',
      situation:
        'Một cơn gió lốc bất ngờ làm đổ vỡ chiếc bình gốm tâm huyết mà Cụ Tâm đã nặn suốt ba tháng để dâng cúng lễ hội. Người thợ phụ vô tình không đóng cửa sổ đang quỳ run rẩy xin chịu phạt.',
      choices: [
        {
          id: 'imp_compassionate',
          label: 'Cùng Cụ Tâm quán chiếu lẽ thành-trụ-hoại-không, đỡ người thợ phụ dậy và dùng kỹ nghệ Kintsugi gắn lại các mảnh gốm bằng nhũ vàng làm biểu tượng của sự chuyển hóa.',
          alignment: 'compassionate',
          meritDelta: 50,
          negativeKarmaDelta: 0,
          expDelta: 70,
          consequenceText:
            'Chiếc bình gốm hàn gắn bằng nhũ vàng trở thành tuyệt tác cảm động nhất lễ hội; tình thầy trò càng thêm bền chặt.',
          teachingExplanation:
            'Thấu hiểu Vô Thường giúp tâm không sụp đổ hay sân giận trước sự mất mát, mà bình tâm chuyển hóa nghịch cảnh.',
        },
        {
          id: 'imp_neutral',
          label: 'Thở dài nói "của đi thay người" rồi lặng lẽ gom các mảnh vỡ vứt đi.',
          alignment: 'neutral',
          meritDelta: 10,
          negativeKarmaDelta: 0,
          expDelta: 25,
          consequenceText:
            'Cơn giận không bùng lên nhưng sự tiếc nuối vẫn đè nặng trong lòng cả hai thầy trò.',
          teachingExplanation:
            'Chấp nhận thụ động giúp bớt sân, nhưng quán chiếu sâu sắc còn biến sự vô thường thành bài học trí tuệ.',
        },
        {
          id: 'imp_harmful',
          label: 'Xúi Cụ Tâm đuổi việc người thợ phụ và bắt anh ta bồi thường gấp mười lần giá trị chiếc bình.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 140,
          expDelta: 10,
          consequenceText:
            'Người thợ nghèo lâm vào cảnh màn trời chiếu đất; Cụ Tâm mang tiếng khắc nghiệt và lòng đầy bất an.',
          teachingExplanation:
            'Vì chấp chặt vào vật chất hữu vi mà tàn nhẫn với con người là đánh mất lòng từ bi trước quy luật Vô Thường.',
        },
      ],
    },
    reflectionQuestion:
      'Nếu biết mọi duyên lành hôm nay đều vô thường, bạn sẽ trân trọng và đối xử với những người xung quanh mình khác đi như thế nào?',
  },
  {
    id: 'wisdom_non_attachment',
    title: 'Vô Chấp & Buông Xả: Chiếc Bè Qua Sông',
    category: 'non_attachment',
    traditionNote: 'Kinh Ví Dụ Con Rắn (Trung Bộ Kinh) & Tinh thần Bát Nhã Tâm Kinh (Mahāyāna)',
    summaryStory:
      'Trong Kinh Ví Dụ Con Rắn, Đức Phật kể chuyện một người kết bè để vượt qua dòng sông lớn nguy hiểm. Khi đã sang đến bờ bên kia an toàn, người có trí sẽ để chiếc bè lại bên bến cho người sau dùng, chứ không đội chiếc bè nặng trĩu ấy lên đầu mà đi tiếp. Mọi danh vọng, tài sản hay thậm chí sự tự hào về công đức nếu chấp chặt vào đều biến thành gánh nặng.',
    sourceCitation:
      'Kinh Ví Dụ Con Rắn — Pháp dụ Chiếc Bè (Alagaddūpama Sutta, MN 22) & Bát Nhã Tâm Kinh',
    dilemmaScenario: {
      npcName: 'Đạo Hữu Chấp Tướng Hoằng Minh',
      situation:
        'Hoằng Minh vừa quyên góp dựng một cây cột đá trong chùa và nhất quyết đòi khắc tên mình thật to ngay chính giữa bàn thờ Phật, nếu ai phản đối thì ông dọa sẽ đập bỏ cột đá.',
      choices: [
        {
          id: 'nonatt_compassionate',
          label: 'Ôn tồn giảng giải về phước báu "Bố thí Ba-la-mật" (Tam luân không tịch — không chấp người cho, người nhận và vật cho), khuyên ông ghi tên vào sổ công đức chung để giữ vẻ trang nghiêm cho Tam Bảo.',
          alignment: 'compassionate',
          meritDelta: 50,
          negativeKarmaDelta: 0,
          expDelta: 65,
          consequenceText:
            'Hoằng Minh hiểu ra đạo lý Vô Chấp, vui vẻ buông bỏ sự đòi hỏi hư danh và tâm hồn trở nên nhẹ nhàng chưa từng có.',
          teachingExplanation:
            'Làm phước mà không chấp vào tướng trạng hay danh tiếng mới mang lại công đức thanh tịnh vô lượng.',
        },
        {
          id: 'nonatt_neutral',
          label: 'Để mặc ông ta tranh cãi với ban quản tự vì không muốn liên lụy.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Cuộc tranh cãi kéo dài làm mất đi sự thanh tịnh của sân chùa suốt cả buổi chiều.',
          teachingExplanation:
            'Thấy người đồng tu mắc kẹt trong chấp tướng mà không khéo lời khuyên giải thì thiếu hạnh hộ pháp.',
        },
        {
          id: 'nonatt_harmful',
          label: 'Kích động Hoằng Minh đập phá cột đá và gây rối trước cổng chùa để đòi lại tiền cúng dường.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 190,
          expDelta: 10,
          consequenceText:
            'Cảnh chùa bị hư hại, công đức biến thành oán nghiệp phá hoại chốn tôn nghiêm.',
          teachingExplanation:
            'Từ tâm chấp công biến thành tâm sân hận phá hoại Tam Bảo là nhân dẫn thẳng xuống Địa Ngục Đài Phá Hoại.',
        },
      ],
    },
    reflectionQuestion:
      'Có chiếc "bè" nào từng giúp bạn trong quá khứ (một danh hiệu cũ, một lời khen, hay một định kiến) mà nay bạn vẫn đang vác nặng trên vai không?',
  },
  {
    id: 'wisdom_karma_causality',
    title: 'Luật Nhân Quả: Tác Ý Tạo Nghiệp, Tâm Chuyển Vận Mệnh',
    category: 'karma_causality',
    traditionNote: 'Kinh Thể Đạt (Tăng Chi Bộ) & Kinh Tiểu Nghiệp Phân Biệt (Trung Bộ Kinh)',
    summaryStory:
      'Đức Phật tuyên bố rõ ràng trong Kinh Thể Đạt: "Này các Tỳ-kheo, Tác ý (Cetanā — ý chí/chủ tâm) chính là Nghiệp. Có tác ý rồi mới tạo nghiệp bằng thân, bằng lời nói, bằng ý nghĩ." Luật Nhân Quả trong đạo Phật không phải là thuyết định mệnh cứng nhắc; hạt giống đã gieo trong quá khứ gặp duyên hiện tại sẽ trổ quả, nhưng chính lựa chọn thiện lành ngay giây phút này sẽ chuyển hóa tương lai.',
    sourceCitation:
      'Kinh Thể Đạt (Nibbedhika Sutta, AN 6.63) & Kinh Tiểu Nghiệp Phân Biệt (Cūḷakammavibhaṅga Sutta, MN 135)',
    dilemmaScenario: {
      npcName: 'Thanh Niên Bất Đắc Chí Vạn Thành',
      situation:
        'Vạn Thành nghe một thầy bói phán rằng số anh "mệnh xấu, cả đời nghèo khổ", nên anh sinh tâm buông xuôi, định gia nhập băng đảng trộm cướp vì nghĩ "đằng nào số cũng khổ rồi".',
      choices: [
        {
          id: 'karma_compassionate',
          label: 'Giải thích rõ giáo lý Nhân Quả của Đức Phật không phải là định mệnh cố định; khuyến khích anh gieo nhân lành mới và giới thiệu anh vào làm việc tại xưởng mộc thiện nguyện.',
          alignment: 'compassionate',
          meritDelta: 55,
          negativeKarmaDelta: 0,
          expDelta: 75,
          consequenceText:
            'Vạn Thành bừng tỉnh, chăm chỉ rèn nghề và làm việc thiện, chỉ sau một năm đã có cuộc sống ấm no, lương thiện.',
          teachingExplanation:
            'Hiểu đúng Nhân Quả giúp con người làm chủ vận mệnh thông qua từng tác ý và hành động thiện lành ở hiện tại.',
        },
        {
          id: 'karma_neutral',
          label: 'Cho anh ta một ít tiền lẻ rồi khuyên anh ta đi xem một thầy bói khác.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Vạn Thành vẫn hoang mang trong vòng luẩn quẩn của sự mê tín dị đoan.',
          teachingExplanation:
            'Bố thí vật chất nhỏ mà không tháo gỡ tà kiến về định mệnh thì chưa cứu được tâm người.',
        },
        {
          id: 'karma_harmful',
          label: 'Cổ vũ anh ta đi cướp bóc và chỉ điểm một kho hàng không có người canh gác để chia chác chiến lợi phẩm.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 220,
          expDelta: 10,
          consequenceText:
            'Cả hai cùng gieo trọng nghiệp trộm cướp, làm hại người lương thiện và bị Nghiệp Kính Đài ghi nhận.',
          teachingExplanation:
            'Cố ý (Tác ý) xúi giục và đồng lõa trong việc ác tạo ra cộng nghiệp nặng nề dẫn vào cảnh giới khổ đau.',
        },
      ],
    },
    reflectionQuestion:
      'Khi hiểu rằng mỗi ý nghĩ, lời nói và hành động hôm nay là một hạt giống cho ngày mai, bạn muốn gieo trồng hạt giống gì ngay bây giờ?',
  },
  {
    id: 'wisdom_gratitude',
    title: 'Tri Ân & Báo Ân: Cội Rễ Của Bậc Chân Nhân',
    category: 'gratitude',
    traditionNote: 'Kinh Tri Ân (Tăng Chi Bộ) & Giáo lý Tứ Trọng Ân trong Phật giáo Đại Thừa và văn hóa Việt Nam',
    summaryStory:
      'Trong Kinh Tăng Chi Bộ, Đức Phật dạy: "Này các Tỳ-kheo, người không biết ơn, không nhớ ơn là biểu hiện của kẻ bất thiện; còn người biết tri ân và báo ân chính là biểu hiện của bậc Chân Nhân (Sappurisa)." Truyền thống Phật giáo gắn liền với văn hóa dân tộc luôn nhắc nhở Tứ Trọng Ân: ơn cha mẹ sinh thành, ơn thầy bạn dạy dỗ, ơn đất nước đồng bào bảo bọc, và ơn Tam Bảo cùng vạn vật nuôi dưỡng.',
    sourceCitation:
      'Kinh Tri Ân (Kataññu Sutta, Tăng Chi Bộ Kinh — AN 2.31–32) & Kinh Tâm Địa Quán (Tứ Trọng Ân)',
    dilemmaScenario: {
      npcName: 'Người Con Xa Quê Hiếu Trung',
      situation:
        'Hiếu Trung mải mê chạy theo danh vọng nơi kinh thành suốt nhiều năm. Nay mẹ già ở quê lâm bệnh nặng nhắn tin mong gặp con, nhưng đúng lúc đó anh lại có một buổi yến tiệc xã giao để thăng chức.',
      choices: [
        {
          id: 'grat_compassionate',
          label: 'Khuyên Hiếu Trung tạm gác buổi tiệc hư danh, lập tức trở về quê chăm sóc mẹ già và tặng anh thang thuốc quý.',
          alignment: 'compassionate',
          meritDelta: 55,
          negativeKarmaDelta: 0,
          expDelta: 75,
          consequenceText:
            'Nhờ sự chăm sóc tận tình và kịp thời của con trai, người mẹ qua cơn nguy kịch; vị quan chủ quản biết chuyện càng trọng dụng người con có hiếu.',
          teachingExplanation:
            'Đức Phật dạy: "Tâm hiếu là tâm Phật, hạnh hiếu là hạnh Phật." Báo hiếu cha mẹ là phước điền tối thượng.',
        },
        {
          id: 'grat_neutral',
          label: 'Bảo anh ta cứ gửi tiền về quê thuê người chăm sóc rồi ở lại dự tiệc cũng được.',
          alignment: 'neutral',
          meritDelta: 5,
          negativeKarmaDelta: 0,
          expDelta: 20,
          consequenceText:
            'Người mẹ có thuốc uống nhưng vẫn mỏi mòn trông ngóng hình bóng con nơi cửa sổ.',
          teachingExplanation:
            'Phụng dưỡng vật chất mà thiếu lòng kính yêu và sự hiện diện ấm áp thì đạo hiếu chưa trọn vẹn.',
        },
        {
          id: 'grat_harmful',
          label: 'Khuyên anh ta cắt đứt liên lạc với người mẹ nghèo ở quê để khỏi ảnh hưởng đến thanh danh nơi quyền quý.',
          alignment: 'harmful',
          meritDelta: 0,
          negativeKarmaDelta: 250,
          expDelta: 10,
          consequenceText:
            'Sự bạc bẽo vong ơn làm chấn động đất trời, nhân quả báo ứng đưa thẳng vào sổ tội Rừng Vong Ơn.',
          teachingExplanation:
            'Bất hiếu và chối bỏ cội nguồn sinh thành là một trong những ác nghiệp nặng nề nhất trong cả đạo lý Phật giáo lẫn luân lý dân gian.',
        },
      ],
    },
    reflectionQuestion:
      'Ai là người đã âm thầm nâng đỡ để bạn có được ngày hôm nay, và bạn có thể gửi đến họ một lời cảm ơn hay hành động báo đền nào ngay trong tuần này?',
  },
];

/**
 * WORLD NPCs ACROSS ALL THREE REALMS (PHÀM GIỚI, THIÊN ĐÌNH, ÂM PHỦ)
 * Includes 3D coordinates, visual styling, greetings, and cultural distinction notes.
 */
export const WORLD_NPCS: WorldNpcConfig[] = [
  {
    id: 'npc_zen_master_tue_minh',
    name: 'Thiền Sư Tuệ Minh',
    title: 'Phương Trượng Chùa Linh Sơn',
    role: 'Thầy hướng dẫn Thiền định & Giáo lý Tứ Diệu Đế',
    realm: 'human',
    position: { x: 0, y: 0, z: -12 },
    rotationY: 0,
    robeColor: '#b45309',
    accentColor: '#fbbf24',
    greeting:
      'A Di Đà Phật! Chào thiện hữu trở về chốn già lam thanh tịnh. Bước chân đã dừng nơi thềm đá, vậy tâm của thiện hữu đã dừng lại cùng hơi thở chưa?',
    culturalOrigin: 'buddhist_monastic',
    dialogueTopics: [
      {
        id: 'topic_cultivation_meaning',
        title: 'Ý nghĩa thực sự của sự Tu Tập',
        prompt: 'Bạch Thầy, tu tập trong Luân Hồi Online có phải chỉ để thăng cấp lên Tiên Giới không ạ?',
        response:
          'Thăng cảnh giới hay phi thăng mây trắng chỉ là hình ảnh ẩn dụ cho tâm thức ngày càng rộng mở, sáng suốt. Trong giáo lý nhà Phật chánh thống, mục đích cao nhất không phải là chạy tìm phép thuật, mà là chuyển hóa Tham – Sân – Si thành Giới – Định – Tuệ ngay trong đời sống hiện tại.',
        culturalNote:
          'Phân biệt rõ: Hệ thống Cảnh Giới & Độ Kiếp là yếu tố văn học Tu Tiên (Xianxia), còn cốt lõi đạo lý là sự chuyển hóa nội tâm của Phật giáo.',
      },
      {
        id: 'topic_karma_balance',
        title: 'Công Đức và Nghiệp Lực vận hành thế nào?',
        prompt: 'Xin Thầy giảng giải về Công Đức (Merit) và Nghiệp Lực (Negative Karma).',
        response:
          'Đức Phật dạy trong Kinh Tăng Chi Bộ: "Tác ý chính là Nghiệp." Mỗi khi thiện hữu khởi tâm lành lễ Phật, tọa thiền, giúp người trong Thư Viện Trí Tuệ thì Công Đức tăng trưởng. Ngược lại, nếu cố ý chọn việc tổn hại chúng sinh thì Nghiệp Lực tích tụ. Khi chỉ số Nhân Quả giảm sâu dưới mức -100, tâm thức tự cảm ứng cảnh giới Âm Phủ để học bài học tỉnh thức.',
        culturalNote:
          'Dựa trên giáo lý Kamma-Vipāka (Nhân quả nghiệp báo do tác ý) trong Kinh điển Nikāya/Āgama.',
      },
    ],
  },
  {
    id: 'npc_nun_tinh_tam',
    name: 'Tịnh Tâm Sư Cô',
    title: 'Thủ Thư Viện Trí Tuệ & Hồ Sen',
    role: 'Người gìn giữ 10 Cuộn Kinh Trí Tuệ & Tư vấn Tình Huống Đạo Đức',
    realm: 'human',
    position: { x: -14, y: 0, z: -6 },
    rotationY: 0.6,
    robeColor: '#78716c',
    accentColor: '#f472b6',
    greeting:
      'Mô Phật! Hương sen trong hồ tỏa ngát cũng không bằng hương của người giữ giới và giàu lòng từ bi. Thiện hữu muốn mở đọc cuộn kinh nào trong Thư Viện Trí Tuệ hôm nay?',
    culturalOrigin: 'buddhist_monastic',
    dialogueTopics: [
      {
        id: 'topic_wisdom_library',
        title: 'Cách học và thực hành tại Thư Viện Trí Tuệ',
        prompt: 'Thưa Sư Cô, con có thể học được gì từ 10 chủ đề trong Thư Viện Trí Tuệ?',
        response:
          'Mỗi chủ đề đều trích dẫn từ kinh điển xác thực như Kinh Pháp Cú, Kinh Chuyển Pháp Luân, Kinh Từ Bi hay Bát Nhã Tâm Kinh, đi kèm một Tình Huống Nhân Quả giữa đời thường. Lựa chọn Từ Bi sẽ vun bồi Công Đức; còn nếu thử chọn lối ích kỷ hại người, thiện hữu sẽ thấy Nghiệp Lực lập tức ghi vào Sổ Nhân Quả.',
      },
      {
        id: 'topic_return_from_hell',
        title: 'Lời động viên cho người vừa từ Địa Ngục trở về',
        prompt: 'Nếu lỡ phạm sai lầm và phải xuống 18 tầng địa ngục, con có còn cơ hội tu tập lại không?',
        response:
          'Hoa sen đẹp nhất chính là hoa sen vươn lên từ bùn tối! Trong Phật pháp không có án phạt vĩnh viễn. Chỉ cần thiện hữu hoàn thành Hành Trình Chuộc Lỗi và khởi tâm Sám Hối chân thành, nghiệp chướng được hóa giải về 0 và cánh cửa chùa Linh Sơn luôn rộng mở đón thiện hữu trở về.',
      },
    ],
  },
  {
    id: 'npc_guardian_kim_cang',
    name: 'Hộ Pháp Kim Cang',
    title: 'Thần Hộ Già Lam & Gác Chuông',
    role: 'Bảo hộ Đạo Tràng & Điều phối Sự Kiện Cộng Đồng',
    realm: 'human',
    position: { x: 14, y: 0, z: -6 },
    rotationY: -0.6,
    robeColor: '#991b1b',
    accentColor: '#f59e0b',
    greeting:
      'Chào người tu hành! Nhìn gương mặt uy nghiêm của bậc Hộ Pháp chớ vội sợ hãi — sự nghiêm khắc này là để nhắc nhở mỗi người tự răn mình: Khuyến Thiện và Trừng Ác!',
    culturalOrigin: 'buddhist_dharmapala',
    dialogueTopics: [
      {
        id: 'topic_khuyen_thien_trung_ac',
        title: 'Biểu tượng Hộ Pháp Khuyến Thiện – Trừng Ác tại chùa Việt',
        prompt: 'Thưa Ngài, vì sao nơi cổng chùa và tiền đường thường có tượng Hộ Pháp uy dũng?',
        response:
          'Trong kiến trúc chùa cổ Việt Nam, hai vị Hộ Pháp (Ông Thiện mặc giáp vàng nét mặt hiền hòa và Ông Ác nét mặt uy nghiêm) nhắc nhở khách thập phương rằng: bước qua cổng Tam Quan là bước vào vùng đất của lương tri. Thiện tâm cần được nâng đỡ, còn ác niệm trong lòng phải được hàng phục.',
        culturalNote:
          'Truyền thống mỹ thuật và tín ngưỡng Hộ Pháp đặc trưng của Phật giáo Việt Nam (như bộ tượng Hộ Pháp chùa Tây Phương, chùa Mía).',
      },
      {
        id: 'topic_community_events',
        title: 'Nghi thức Cộng Tu: 108 Lạy & Hoa Đăng',
        prompt: 'Làm sao để tham gia các sự kiện cộng đồng cùng đại chúng trong phòng?',
        response:
          'Khi tiếng Đại Hồng Chung ngân vang, tất cả hành giả trong phòng có thể cùng nhau Lễ Bái 108 Lạy, Thiền Định Tập Thể hoặc Thả Đèn Hoa Đăng. Sức mạnh cộng hưởng của đại chúng (Cộng nghiệp thiện) sẽ mang lại Công Đức viên mãn cho tất cả mọi người!',
      },
    ],
  },
  {
    id: 'npc_celestial_thanh_van',
    name: 'Tiên Đồng Thanh Vân',
    title: 'Sứ Giả Cửu Trùng Vân Cung',
    role: 'Hướng dẫn Thiên Giới & Đài Độ Kiếp (Lôi Kiếp)',
    realm: 'celestial',
    position: { x: 0, y: 2, z: -10 },
    rotationY: 0,
    robeColor: '#0284c7',
    accentColor: '#fef08a',
    greeting:
      'Chúc mừng đạo hữu đã câu thông thiên địa, bước lên Cửu Trùng Vân Cung! Mây lành vạn trượng nơi đây đều kết tụ từ công đức và định lực kiên cố của người tu hành.',
    culturalOrigin: 'xianxia_celestial',
    dialogueTopics: [
      {
        id: 'topic_tribulation_lore',
        title: 'Thiên Kiếp (Độ Kiếp) là gì?',
        prompt: 'Xin Tiên Đồng giải thích về nghi thức Vượt Thiên Kiếp tại Đài Độ Kiếp.',
        response:
          'Trong văn hóa huyền huyễn Tu Tiên (Xianxia), mỗi khi bước lên cảnh giới cao hơn (từ Tiên Nhân đến Thiên Đạo Cảnh), hành giả phải vượt qua Lôi Kiếp, Hỏa Kiếp hay Tâm Ma Kiếp. Nhưng xét về lý đạo sâu xa, sấm sét trên trời chính là phép thử xem tâm đạo hữu có còn dao động trước sợ hãi và cám dỗ hay không!',
        culturalNote:
          'Phân biệt văn hóa: "Độ Kiếp / Lôi Kiếp" là mô-típ giả tưởng của dòng văn học Tu Tiên (Xianxia), được kết hợp vào game như thử thách vượt qua Tâm Ma (chướng ngại tâm lý).',
      },
    ],
  },
  {
    id: 'npc_judge_thoi_giac',
    name: 'Phán Quan Thôi Giác (崔珏)',
    title: 'Chưởng Quản Sổ Sinh Tử & Nghiệp Kính Đài',
    role: 'Thẩm phán Nhân Quả tại Điện Phán Xét Âm Phủ',
    realm: 'underworld',
    position: { x: 0, y: 0, z: -10 },
    rotationY: 0,
    robeColor: '#31102f',
    accentColor: '#ef4444',
    greeting:
      'Trước Nghiệp Kính Đài, mọi lời biện bạch đều vô nghĩa! Thiện ác phân minh, bút chu sa chỉ ghi lại đúng những gì chính tâm và tay ngươi đã làm nơi dương thế.',
    culturalOrigin: 'folk_underworld',
    dialogueTopics: [
      {
        id: 'topic_mirror_of_karma',
        title: 'Nghiệp Kính Đài và Tín Ngưỡng Dân Gian Âm Phủ',
        prompt: 'Bẩm Phán Quan, Nghiệp Kính Đài và 18 Tầng Địa Ngục có nguồn gốc như thế nào?',
        response:
          'Hình tượng Phán Quan cầm bút chu sa, Thập Điện Diêm Vương và 18 Tầng Địa Ngục là sự giao thoa giữa khái niệm Địa Ngục (Naraka) của Phật giáo Ấn Độ với tín ngưỡng dân gian Á Đông & Việt Nam. Nhưng hãy nhớ cốt tủy này: Nghiệp Kính Đài không phải chiếc gương phép thuật của ta, mà chính là Lương Tâm của ngươi tự soi chiếu lại hành vi của mình!',
        culturalNote:
          'Tín ngưỡng dân gian Á Đông (Thập Điện Diêm Vương, Phán Quan Thôi Giác, Ngọc Lịch Bảo Sao) được giải thích dưới góc nhìn tâm lý và nhân quả Phật giáo.',
      },
      {
        id: 'topic_how_to_redeem',
        title: 'Làm sao để thoát khỏi án phạt Địa Ngục?',
        prompt: 'Con đã nhận ra lỗi lầm của mình, làm sao để được trở về Phàm Giới?',
        response:
          'Luật Âm Phủ tuy nghiêm nhưng luôn mở đường hiếu sinh. Hãy bước vào tầng ngục tương ứng với nghiệp lực của ngươi, hoàn thành thử thách rèn tâm và trả lời câu hỏi quán chiếu của vị Giám Ngục bằng trí tuệ tỉnh thức. Khi ngươi thực sự biết hổ thẹn và hướng thiện, bản án lập tức được xóa bỏ!',
      },
    ],
  },
  {
    id: 'npc_underworld_envoy',
    name: 'Sứ Giả Địa Ngục (Quỷ Sứ Dẫn Đường)',
    title: 'Thủ Hộ Cầu Nại Hà & Cửa Ngục',
    role: 'Dẫn đường qua 18 Tầng Địa Ngục & Hướng dẫn Chuộc Lỗi',
    realm: 'underworld',
    position: { x: -8, y: 0, z: -4 },
    rotationY: 0.5,
    robeColor: '#1e293b',
    accentColor: '#38bdf8',
    greeting:
      'Đứng bên Cầu Nại Hà nhìn dòng sông Vong Xuyên cuộn chảy, ai cũng thở dài tiếc nuối. Nhưng đừng tuyệt vọng, bước chân chuộc lỗi bắt đầu ngay từ giây phút biết quay đầu!',
    culturalOrigin: 'folk_underworld',
    dialogueTopics: [
      {
        id: 'topic_nai_ha_bridge',
        title: 'Truyền thuyết Cầu Nại Hà và Mạnh Bà',
        prompt: 'Xin Sứ Giả kể về Cầu Nại Hà trong văn hóa dân gian.',
        response:
          'Trong truyền thuyết dân gian Việt – Hoa, Cầu Nại Hà ("Nại Hà" nghĩa là "biết làm sao được") là cây cầu nối giữa phán xét và tái sinh, nơi Mạnh Bà trao bát canh quên lãng. Tuy nhiên, trong Luân Hồi Online, ta không bắt ngươi uống canh quên hết đạo lý — trái lại, ngươi phải giữ trọn ký ức tỉnh thức để tự mình vượt qua thử thách trong tầng ngục và trở về làm người lương thiện!',
        culturalNote:
          'Cầu Nại Hà và Mạnh Bà thuộc văn hóa dân gian (Folklore), không phải kinh điển Phật giáo nguyên thủy.',
      },
    ],
  },
];

/**
 * Helper to determine which Hell Level (1..18) a player is sentenced to based on karmaBalance.
 * Returns null if karmaBalance > -100 (player is free).
 */
export function getHellLevelForKarma(karmaBalance: number): HellLevelConfig | null {
  if (karmaBalance > -100) {
    return null;
  }
  // Find the deepest level whose threshold is >= karmaBalance (since thresholds are negative: -100 down to -3500)
  let matched: HellLevelConfig = HELL_LEVELS[0];
  for (const levelConfig of HELL_LEVELS) {
    if (karmaBalance <= levelConfig.karmaThreshold) {
      matched = levelConfig;
    } else {
      break;
    }
  }
  return matched;
}

export function getHellLevelByNumber(level: number): HellLevelConfig | undefined {
  return HELL_LEVELS.find((h) => h.level === level);
}

export function getWisdomEntryById(id: string): WisdomEntry | undefined {
  return WISDOM_LIBRARY.find((w) => w.id === id);
}
