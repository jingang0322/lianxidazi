/* ============================================================
   data.js —— 静态数据：指法映射、键盘布局、关卡、练习类型、成就
   ============================================================ */

/* ---------- 手指定义 ---------- */
const FINGER = {
  pinky:{zh:'小指', tip:'小指力量较弱，击键幅度要小，击键后立即回到基准键。'},
  ring:{zh:'无名指', tip:'无名指较难独立控制，多练习以提升灵活性，避免带动其他手指。'},
  middle:{zh:'中指', tip:'中指较长，负责范围较广，注意击键力度均匀。'},
  index:{zh:'食指', tip:'食指最灵活，负责键位最多，注意移动后迅速回位到 F/J 基准键。'},
  thumb:{zh:'拇指', tip:'拇指专用于空格键，轻快点击，其余手指保持基准位不动。'}
};
const HANDZH = {left:'左手', right:'右手', thumb:'拇指'};

/* ---------- 完整标准指法映射（以 event.code 为键，跨输入法稳定） ---------- */
const FINGER_MAP = {
  Backquote:{hand:'left',finger:'pinky',row:'数字排',char:'`'},
  Digit1:{hand:'left',finger:'pinky',row:'数字排',char:'1'},
  Digit2:{hand:'left',finger:'ring',row:'数字排',char:'2'},
  Digit3:{hand:'left',finger:'middle',row:'数字排',char:'3'},
  Digit4:{hand:'left',finger:'index',row:'数字排',char:'4'},
  Digit5:{hand:'left',finger:'index',row:'数字排',char:'5'},
  Digit6:{hand:'right',finger:'index',row:'数字排',char:'6'},
  Digit7:{hand:'right',finger:'index',row:'数字排',char:'7'},
  Digit8:{hand:'right',finger:'middle',row:'数字排',char:'8'},
  Digit9:{hand:'right',finger:'ring',row:'数字排',char:'9'},
  Digit0:{hand:'right',finger:'pinky',row:'数字排',char:'0'},
  Minus:{hand:'right',finger:'pinky',row:'数字排',char:'-'},
  Equal:{hand:'right',finger:'pinky',row:'数字排',char:'='},
  KeyQ:{hand:'left',finger:'pinky',row:'上排',char:'Q'},
  KeyW:{hand:'left',finger:'ring',row:'上排',char:'W'},
  KeyE:{hand:'left',finger:'middle',row:'上排',char:'E'},
  KeyR:{hand:'left',finger:'index',row:'上排',char:'R'},
  KeyT:{hand:'left',finger:'index',row:'上排',char:'T'},
  KeyY:{hand:'right',finger:'index',row:'上排',char:'Y'},
  KeyU:{hand:'right',finger:'index',row:'上排',char:'U'},
  KeyI:{hand:'right',finger:'middle',row:'上排',char:'I'},
  KeyO:{hand:'right',finger:'ring',row:'上排',char:'O'},
  KeyP:{hand:'right',finger:'pinky',row:'上排',char:'P'},
  BracketLeft:{hand:'right',finger:'pinky',row:'上排',char:'['},
  BracketRight:{hand:'right',finger:'pinky',row:'上排',char:']'},
  Backslash:{hand:'right',finger:'pinky',row:'上排',char:'\\'},
  KeyA:{hand:'left',finger:'pinky',row:'中排',char:'A',home:true},
  KeyS:{hand:'left',finger:'ring',row:'中排',char:'S',home:true},
  KeyD:{hand:'left',finger:'middle',row:'中排',char:'D',home:true},
  KeyF:{hand:'left',finger:'index',row:'中排',char:'F',home:true},
  KeyG:{hand:'left',finger:'index',row:'中排',char:'G'},
  KeyH:{hand:'right',finger:'index',row:'中排',char:'H'},
  KeyJ:{hand:'right',finger:'index',row:'中排',char:'J',home:true},
  KeyK:{hand:'right',finger:'middle',row:'中排',char:'K',home:true},
  KeyL:{hand:'right',finger:'ring',row:'中排',char:'L',home:true},
  Semicolon:{hand:'right',finger:'pinky',row:'中排',char:';',home:true},
  Quote:{hand:'right',finger:'pinky',row:'中排',char:"'"},
  KeyZ:{hand:'left',finger:'pinky',row:'下排',char:'Z'},
  KeyX:{hand:'left',finger:'ring',row:'下排',char:'X'},
  KeyC:{hand:'left',finger:'middle',row:'下排',char:'C'},
  KeyV:{hand:'left',finger:'index',row:'下排',char:'V'},
  KeyB:{hand:'left',finger:'index',row:'下排',char:'B'},
  KeyN:{hand:'right',finger:'index',row:'下排',char:'N'},
  KeyM:{hand:'right',finger:'index',row:'下排',char:'M'},
  Comma:{hand:'right',finger:'middle',row:'下排',char:','},
  Period:{hand:'right',finger:'ring',row:'下排',char:'.'},
  Slash:{hand:'right',finger:'pinky',row:'下排',char:'/'},
  ShiftLeft:{hand:'left',finger:'pinky',row:'功能键',char:'Shift'},
  ShiftRight:{hand:'right',finger:'pinky',row:'功能键',char:'Shift'},
  CapsLock:{hand:'left',finger:'pinky',row:'功能键',char:'CapsLock'},
  Tab:{hand:'left',finger:'pinky',row:'功能键',char:'Tab'},
  Enter:{hand:'right',finger:'pinky',row:'功能键',char:'Enter'},
  Backspace:{hand:'right',finger:'pinky',row:'功能键',char:'Backspace'},
  Space:{hand:'thumb',finger:'thumb',row:'功能键',char:'空格'},
  Numpad0:{hand:'thumb',finger:'thumb',row:'小键盘',char:'0'},
  Numpad1:{hand:'right',finger:'index',row:'小键盘',char:'1'},
  Numpad2:{hand:'right',finger:'middle',row:'小键盘',char:'2'},
  Numpad3:{hand:'right',finger:'ring',row:'小键盘',char:'3'},
  Numpad4:{hand:'right',finger:'index',row:'小键盘',char:'4'},
  Numpad5:{hand:'right',finger:'middle',row:'小键盘',char:'5'},
  Numpad6:{hand:'right',finger:'ring',row:'小键盘',char:'6'},
  Numpad7:{hand:'right',finger:'index',row:'小键盘',char:'7'},
  Numpad8:{hand:'right',finger:'middle',row:'小键盘',char:'8'},
  Numpad9:{hand:'right',finger:'ring',row:'小键盘',char:'9'},
  NumpadAdd:{hand:'right',finger:'pinky',row:'小键盘',char:'+'},
  NumpadSubtract:{hand:'right',finger:'pinky',row:'小键盘',char:'-'},
  NumpadMultiply:{hand:'right',finger:'pinky',row:'小键盘',char:'*'},
  NumpadDivide:{hand:'right',finger:'pinky',row:'小键盘',char:'/'},
  NumpadDecimal:{hand:'right',finger:'ring',row:'小键盘',char:'.'},
  NumpadEnter:{hand:'right',finger:'pinky',row:'小键盘',char:'Enter'}
};

function fingerFullName(hand, finger){
  if(finger === 'thumb') return '拇指（空格键）';
  return HANDZH[hand] + FINGER[finger].zh;
}
function getFingerInfo(code){
  const f = FINGER_MAP[code];
  if(!f) return null;
  const fullName = fingerFullName(f.hand, f.finger);
  return {
    hand:f.hand, finger:f.finger, row:f.row, char:f.char, fullName,
    tip: f.home ? '「'+f.char+'」是基准键，'+fullName+'常驻于此，指尖轻触键帽中央。' :
         (f.finger==='thumb' ? '空格键由拇指轻快点击，其余手指保持基准位。' :
          (f.hand==='right' && f.finger==='pinky' && ['Enter','Backspace','Shift'].includes(f.char)) ? '「'+f.char+'」由右手小指负责，击键幅度稍大，完成后迅速回位。' :
          '「'+f.char+'」键由'+fullName+'击打，位于'+f.row+'，击键后手指迅速回弹到基准键位。')
  };
}
function charToCode(ch){
  if(ch === ' ') return 'Space';
  if(ch === '\n' || ch === '\r') return 'Enter';
  if(/[0-9]/.test(ch)) return 'Digit' + ch;
  if(/[A-Za-z]/.test(ch)) return 'Key' + ch.toUpperCase();
  const punct = {'`':'Backquote','-':'Minus','=':'Equal','[':'BracketLeft',']':'BracketRight','\\':'Backslash',';':'Semicolon',"'":'Quote',',':'Comma','.':'Period','/':'Slash'};
  return Object.prototype.hasOwnProperty.call(punct, ch) ? punct[ch] : null;
}

/* ---------- 虚拟键盘布局 ---------- */
const KEYBOARD_ROWS = [
  ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backspace'],
  ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
  ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter'],
  ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight'],
  ['Space']
];
const KEY_LABEL = {
  Backquote:['`','~'], Digit1:['1','!'], Digit2:['2','@'], Digit3:['3','#'], Digit4:['4','$'],
  Digit5:['5','%'], Digit6:['6','^'], Digit7:['7','&'], Digit8:['8','*'], Digit9:['9','('],
  Digit0:['0',')'], Minus:['-','_'], Equal:['=','+'],
  BracketLeft:['[','{'], BracketRight:[']','}'], Backslash:['\\','|'],
  Semicolon:[';',':'], Quote:["'",'"'], Comma:[',','<'], Period:['.','>'], Slash:['/','?'],
  Backspace:['⌫'], Tab:['Tab'], CapsLock:['Caps'], Enter:['Enter'], ShiftLeft:['Shift'], ShiftRight:['Shift'], Space:['空格']
};
const KEY_WIDTH = {
  Backspace:'wide2', Tab:'wide1', CapsLock:'wide2', Enter:'wide2', ShiftLeft:'wide3', ShiftRight:'wide3', Space:'space'
};

/* ---------- 关卡数据（24 关，难度递增） ---------- */
function wordsFromText(t){ return t.split(' ').filter(Boolean).map(w=>({show:'', type:w})); }
function wordsFromPairs(pairs){ return pairs.map(p=>({show:p[0], type:p[1]})); }

const LEVELS = [
  {cat:'英语学习关', name:'字母入门·中排键', acc:.85, words: wordsFromText('asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; gh'), tip:'掌握基准键 A S D F J K L ;'},
  {cat:'英语学习关', name:'字母入门·上排键', acc:.85, words: wordsFromText('qwer uiop qwer uiop rtyu poiuy trew'), tip:'上排键 Q W E R 与 U I O P'},
  {cat:'英语学习关', name:'字母入门·下排键', acc:.85, words: wordsFromText('zxcv bnm, zxcv bnm vbnm cxz'), tip:'下排键 Z X C V 与 N M , . /'},
  {cat:'英语学习关', name:'字母入门·数字行', acc:.85, words: wordsFromText('12345 67890 1234 5678 90'), tip:'数字行由左右手食指到小指分管'},
  {cat:'英语学习关', name:'字母入门·综合', acc:.88, words: wordsFromText('the quick brown fox jumps over the lazy dog'), tip:'综合运用全部键位'},
  {cat:'英语学习关', name:'常见英语单词·基础', acc:.88, words: wordsFromText('hello world apple happy school friend'), tip:'高频基础单词'},
  {cat:'英语学习关', name:'常见英语单词·进阶', acc:.9, streak:8, words: wordsFromText('computer keyboard language practice improve learning'), tip:'进阶单词，注意连续正确'},
  {cat:'英语学习关', name:'英语短句·基础', acc:.9, words: wordsFromText('hello world. i love typing every day.'), tip:'包含标点的英文短句'},
  {cat:'英语学习关', name:'英语短句·进阶', acc:.92, time:60, words: wordsFromText('the quick brown fox jumps over the lazy dog. practice makes perfect.'), tip:'限时 60 秒完成进阶短句'},

  {cat:'单词学习关', name:'单词·基础一', acc:.88, words: wordsFromPairs([['苹果','apple'],['狗','dog'],['猫','cat'],['书','book'],['水','water']]), tip:'看中文释义，输入对应英文'},
  {cat:'单词学习关', name:'单词·基础二', acc:.88, words: wordsFromPairs([['花','flower'],['鸟','bird'],['鱼','fish'],['太阳','sun'],['月亮','moon']]), tip:'基础名词英文拼写'},
  {cat:'单词学习关', name:'单词·进阶一', acc:.9, words: wordsFromPairs([['电脑','computer'],['朋友','friend'],['学校','school'],['家庭','family'],['老师','teacher']]), tip:'常用进阶单词'},
  {cat:'单词学习关', name:'单词·进阶二', acc:.9, streak:10, words: wordsFromPairs([['环境','environment'],['知识','knowledge'],['技术','technology'],['成功','success'],['快乐','happiness']]), tip:'较长单词，注意连续正确'},
  {cat:'单词学习关', name:'单词·挑战', acc:.92, time:50, words: wordsFromPairs([['字典','dictionary'],['图书馆','library'],['餐厅','restaurant'],['科学','science'],['数学','mathematics']]), tip:'限时挑战较长单词'},
  {cat:'单词学习关', name:'单词·综合', acc:.92, time:60, words: wordsFromPairs([['世界','world'],['音乐','music'],['运动','sport'],['健康','health'],['梦想','dream']]), tip:'综合单词测试'},

  {cat:'语文学习关', name:'拼音·单字', acc:.88, words: wordsFromPairs([['你','ni'],['我','wo'],['他','ta'],['好','hao'],['爱','ai']]), tip:'看汉字，输入全拼拼音'},
  {cat:'语文学习关', name:'拼音·常用词', acc:.88, words: wordsFromPairs([['你好','nihao'],['中国','zhongguo'],['学习','xuexi'],['电脑','diannao'],['键盘','jianpan']]), tip:'常用词拼音'},
  {cat:'语文学习关', name:'拼音·成语', acc:.9, words: wordsFromPairs([['一心一意','yixinyiyi'],['画龙点睛','hualongdianjing'],['守株待兔','shouzhudaitu']]), tip:'成语全拼输入'},
  {cat:'语文学习关', name:'古诗名句·一', acc:.9, words: wordsFromPairs([['床前明月光','chuangqianmingyueguang']]), tip:'古诗名句拼音'},
  {cat:'语文学习关', name:'古诗名句·二', acc:.9, words: wordsFromPairs([['春眠不觉晓','chunmianbujuexiao']]), tip:'古诗名句拼音'},
  {cat:'语文学习关', name:'成语·二', acc:.92, streak:12, words: wordsFromPairs([['亡羊补牢','wangyangbulao'],['刻舟求剑','kezhouqiujian'],['拔苗助长','bamiaozhuzhang']]), tip:'更多成语，注意连续正确'},
  {cat:'语文学习关', name:'拼音·综合挑战', acc:.92, time:60, words: wordsFromPairs([['好好学习','haohaoxuexi'],['天天向上','tiantianxiangshang']]), tip:'限时综合拼音'},
  {cat:'语文学习关', name:'古诗名句·三', acc:.92, words: wordsFromPairs([['锄禾日当午','chuheridangwu']]), tip:'古诗名句拼音'},
  {cat:'语文学习关', name:'成语·三', acc:.95, words: wordsFromPairs([['愚公移山','yugongyishan'],['精卫填海','jingweitianhai'],['夸父逐日','kuafuzhuri']]), tip:'高难度成语，正确率≥95%'},
  {cat:'语文学习关', name:'拼音·终极挑战', acc:.95, time:60, words: wordsFromPairs([['天生我材必有用','tianshengwocaibiyouyong']]), tip:'终极挑战：高正确率 + 限时'}
];

/* ---------- 练习类型 ---------- */
const COMMON_WORDS = ['the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','day','get','has','him','his','how','man','new','now','old','see','two','way','who','boy','did','its','let','put','say','she','too','use','that','with','have','this','will','your','from','they','know','want','been','good','much','some','time','very','when','come','here','just','like','long','make','many','more','only','over','such','take','than','them','well','were','work','year'];
const EN_SENTENCES = [
  'the quick brown fox jumps over the lazy dog',
  'practice makes perfect so keep typing every day',
  'a journey of a thousand miles begins with a single step',
  'where there is a will there is a way',
  'success is the sum of small efforts repeated day in and day out',
  'the best way to predict the future is to create it'
];
const PY_SENTENCES = [
  'wo xi huan xue xi da zi',
  'tian tian xiang shang hao hao xue xi',
  'shi jian jiu shi jin qian',
  'zhi xing he yi bu duan jin bu',
  'cong ming de ni yi ding ke yi',
  'jian chi jiu shi sheng li'
];
function randStr(chars, n){ let s=''; for(let i=0;i<n;i++) s += chars[Math.floor(Math.random()*chars.length)]; return s; }
function randMixCase(n){ let s=''; const a='abcdefghijklmnopqrstuvwxyz'; for(let i=0;i<n;i++){ let c=a[Math.floor(Math.random()*26)]; s += Math.random()<.5 ? c.toUpperCase() : c; } return s; }
function randHardCombos(n){
  const combos = ['er','re','ie','ei','th','ht','ou','uo','mn','nm','qw','wq','zx','xz','we','ew','io','oi','tr','rt','gh','hg','uy','yu','nb','bn'];
  let s=''; while(s.length<n) s += combos[Math.floor(Math.random()*combos.length)]; return s.slice(0,n);
}
function randomWords(n){ const a=[...COMMON_WORDS]; const r=[]; for(let i=0;i<n;i++){ r.push(a.splice(Math.floor(Math.random()*a.length),1)[0]); } return r; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const PRACTICE_TYPES = [
  {id:'num-random', icon:'🔢', name:'随机数字串', desc:'随机 0-9 数字串', gen:()=>randStr('0123456789', 45)},
  {id:'num-main', icon:'1️⃣', name:'主键盘数字', desc:'主键盘数字行练习', gen:()=>randStr('0123456789', 45)},
  {id:'num-pad', icon:'🔟', name:'小键盘数字', desc:'小键盘数字指法练习', gen:()=>randStr('0123456789', 45)},
  {id:'alpha-random', icon:'🔤', name:'随机字母', desc:'随机小写字母串', gen:()=>randStr('abcdefghijklmnopqrstuvwxyz', 45)},
  {id:'alpha-mix', icon:'🔠', name:'大小写混合', desc:'随机大小写字母', gen:()=>randMixCase(40)},
  {id:'alpha-hard', icon:'⚡', name:'易错键字母组合', desc:'常见易错字母组合', gen:()=>randHardCombos(40)},
  {id:'word', icon:'📖', name:'常用英语单词', desc:'高频英语单词列表', gen:()=>randomWords(12).join(' ')},
  {id:'sentence-en', icon:'🗣️', name:'英文句子', desc:'完整英文句子练习', gen:()=>pick(EN_SENTENCES)},
  {id:'sentence-pinyin', icon:'🀄', name:'中文拼音句子', desc:'拼音句子练习', gen:()=>pick(PY_SENTENCES)},
  {id:'custom', icon:'📝', name:'自定义练习', desc:'粘贴自己的文本', custom:true}
];

/* ---------- 成就定义 ---------- */
const ACHIEVEMENTS = [
  {id:'first', icon:'🌱', name:'初次练习', desc:'完成第一次练习'},
  {id:'streak100', icon:'🔥', name:'连续正确 100 键', desc:'单次练习连续正确 100 键'},
  {id:'wpm60', icon:'⚡', name:'速度 60 WPM', desc:'单次练习速度达到 60 WPM'},
  {id:'wpm100', icon:'🚀', name:'手速之王', desc:'单次练习速度达到 100 WPM'},
  {id:'keys1000', icon:'⌨️', name:'练习千键', desc:'累计正确输入 1000 键'},
  {id:'alllevels', icon:'🏆', name:'闯关大师', desc:'完成全部关卡'},
  {id:'daily', icon:'📅', name:'今日挑战完成', desc:'完成一次每日挑战'},
  {id:'days7', icon:'🗓️', name:'七日坚持', desc:'累计练习满 7 天'}
];
