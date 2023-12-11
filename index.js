const overplay = document.getElementById('overplay')
const loading = document.getElementById('loading')
startButton.addEventListener('click', start)
$('.example1').typeIt({
  whatToType: "press E to light or R to close door",
  typeSpeed: 50,
}, () => { });
// 初始化设置
let renderer, camera, scene, light, control, gltf, spotLight, spotLight_, ambient, pos = new THREE.Vector3(-100, 8, 0)
// 玩家互动
let left, center, right, buttom, back, spotlight = false, closedoor = false
// 屏幕宽高相对
let width, height
// 预备量
let pre_left = false, pre_right = false, pre_center = false, pre_buttom = false
// 动画
let center_door_, center_door__, center_door___, center_door____, left_door, right_door, bear_animation
// 声音
// 依次为推左右门，拉左右门，推前门，拉前门
let push_lf_door, push_lf_door2, pull_lf_door, push_c_door, pull_c_door, bear_walk
// 依次为跑步声, 回到床上声, 开关灯声, 背景音乐2, 结束音乐
let walkdooraudio, walkbedaudio, turnonoffaudio, GameoverAudio
// 鬼出现声音, 鬼杀
let mob_appear, bear_kill, bear_left_to_right
// 鬼位置
let mob_position = ["mob_left", "mob_center", "mob_right", "mob_buttom"], mob_position_, atonce = false, mob_position_noappear = false
let mob_inleft = false, mob_inright = false, mob_incenter = false, mob_inbuttom = false
let mob_inleft_ = false, mob_incenter_ = false, mob_inright_ = false, mob_inbuttom_ = false
// 鬼情况
let mob_live = false, gameover, kill_time = false
function start() {
  startButton.innerHTML = '加载中...'
  loading.style.display = 'block'
  document.querySelector("#time").style.display = 'block'
  initAudio()
  initRenderer()
  initScene()
  initCamera()
  initLight()
  loadModel()
  load()
  // 玩法
  time_change()
  dotmouseover()
  mob_create_in_time()
  render()
}
function render() {
  renderer.render(scene, camera)
  TWEEN.update();
  spotLight.position.copy(camera.position)
  spotLight_.position.copy(camera.position)
  camera.lookAt(pos);
  requestAnimationFrame(render)
}
function initRenderer() {
  renderer = new THREE.WebGLRenderer()
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMapSoft = true;
  renderer.shadowMapAutoUpdate = true;
  renderer.sortObjects = false;
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.toneMappingWhitePoint = 1.0;
  renderer.physicallyCorrectLights = true;
  renderer.setClearColor(0x000089, 1.0)
  document.body.appendChild(renderer.domElement)
}
function initScene() {
  scene = new THREE.Scene()
}
function initCamera() {
  camera = new THREE.PerspectiveCamera(70, width / height, 1, 3000)
  camera.updateProjectionMatrix();
}
function initLight() {
  spotLight = new THREE.SpotLight(0xffffff, 1.0);
  spotLight.decay = 0.9;
  spotLight.intensity = 6;
  spotLight.distance = 20
  spotLight.angle = Math.PI / 5.5;
  spotLight.target.position.set(-100, 8, 0)
  spotLight.position.set(-2, 6, -1.2)
  scene.add(spotLight.target)
  scene.add(spotLight);
  spotLight_ = new THREE.SpotLight(0xffffff, 1.0);
  spotLight_.decay = 1;
  spotLight_.intensity = 3;
  spotLight_.distance = 20;
  spotLight_.angle = Math.PI / 5.3;
  spotLight_.target.position.set(-100, 8, 0)
  spotLight_.position.set(-2, 6, -1.2)
  scene.add(spotLight_.target)
  scene.add(spotLight_);
  ambient = new THREE.AmbientLight(0xffffff, 0.06);
  scene.add(ambient);
}

function loadModel() {
  const loader = new THREE.GLTFLoader()
  loader.load('./bedroom.glb', (gltf) => {
    gltf.scene.position.set(8, 1, 0)
    gltf.scene.scale.set(4, 4, 4)
    gltf.scene.rotation.y = Math.PI / 2
    gltf.scene.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true
        child.castShadow = true
      }
    });
    scene.add(gltf.scene)
    const clock = new THREE.Clock();
    const mixer = new THREE.AnimationMixer(gltf.scene)
    // 指定动画名称
    // 前门
    center_door_ = mixer.clipAction(gltf.animations[2]);
    center_door__ = mixer.clipAction(gltf.animations[3]);
    center_door___ = mixer.clipAction(gltf.animations[4]);
    center_door____ = mixer.clipAction(gltf.animations[5]);
    // 左门
    left_door = mixer.clipAction(gltf.animations[0]);
    // 右门
    right_door = mixer.clipAction(gltf.animations[1]);
    for (var i = 0; i < gltf.animations.length; i++) {
      mixer.clipAction(gltf.animations[i]).loop = THREE.LoopOnce;
      mixer.clipAction(gltf.animations[i]).clampWhenFinished = true;
      mixer.clipAction(gltf.animations[i]).timeScale = 1.2
    }
    function loop() {
      requestAnimationFrame(loop);
      const frameT = clock.getDelta();
      mixer.update(frameT);
    }
    loop();
  })
  const loader_bear = new THREE.GLTFLoader()
  loader_bear.load('./bear.glb', (gltf) => {
    // -9 2 -1.2 Math.Pi/2为卧室跳杀
    // -8 3 17.5 Math.Pi /1.6左走廊
    // -8 3 -17.5 Math.Pi / 2.6右走廊
    // 4 2 -1 Math.Pi / 2 * 3床
    // -17.3 1.2 -1.2 Math.Pi / 2柜门
    gltf.scene.scale.set(0.35, 0.35, 0.35)
    gltf.scene.position.set(0, -20, 0)
    gltf.scene.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true
        child.castShadow = true
      }
    });
    scene.add(gltf.scene)
    const clock = new THREE.Clock();
    const mixer = new THREE.AnimationMixer(gltf.scene)
    bear_animation = mixer.clipAction(gltf.animations[0]);
    for (var i = 0; i < gltf.animations.length; i++) {
      mixer.clipAction(gltf.animations[i]).loop = THREE.LoopOnce;
      mixer.clipAction(gltf.animations[i]).clampWhenFinished = true;
      mixer.clipAction(gltf.animations[i]).timeScale = 1.5
    }
    function loop() {
      if (mob_inleft_) {
        gltf.scene.rotation.y = Math.PI / 1.6
        gltf.scene.position.set(-8, 3, 17.5)
        mob_inleft_ = false
      }
      if (mob_incenter_) {
        gltf.scene.rotation.y = Math.PI / 2
        gltf.scene.position.set(-17.3, 1.2, -1.2)
        mob_incenter_ = false
      }
      if (mob_inright_) {
        gltf.scene.rotation.y = Math.PI / 2.6
        gltf.scene.position.set(-8, 3, -17.5)
        mob_inright_ = false
      }
      if (mob_inbuttom_) {
        gltf.scene.rotation.y = Math.PI / 2 * 3
        gltf.scene.position.set(4, 2, -1)
        mob_inbuttom_ = false
      }
      if (mob_position_noappear) {
        gltf.scene.position.set(0, -20, 0)
        mob_position_noappear = false
      }
      requestAnimationFrame(loop);
      const frameT_ = clock.getDelta();
      mixer.update(frameT_);
    }
    loop();
    bear_animation.play()
  })
}
function onWindowResize() {
  camera.aspect = window.innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
function initAudio() {
  walkdooraudio = new Audio()
  walkdooraudio.src = "./walkdoor.aac"
  walkbedaudio = new Audio()
  walkbedaudio.src = "./walkbed.aac"
  turnonoffaudio = new Audio()
  turnonoffaudio.src = "./turnonoff.wav"
  // 关于门的
  push_lf_door = new Audio()
  push_lf_door.src = "./push_lf_door.mp3"
  push_lf_door2 = new Audio()
  push_lf_door2.src = "./push_lf_door2.mp3"
  pull_lf_door = new Audio()
  pull_lf_door.src = "./pull_lf_door.mp3"
  push_c_door = new Audio()
  push_c_door.src = "./push_c_door.mp3"
  pull_c_door = new Audio()
  pull_c_door.src = "./pull_c_door.mp3"
  mob_appear = new Audio()
  mob_appear.src = "./mob_appear.mp3"
  bear_kill = new Audio()
  bear_kill.src = "./bear_kill.aac"
  bear_left_to_right = new Audio()
  bear_left_to_right.src = "./bear_left_to_right.mp3"
  bear_walk = new Audio()
  bear_walk.src = "./bear_walk.aac"
  GameoverAudio = new Audio()
  GameoverAudio.src = "./GameoverAudio.mp3"
  let listener = new THREE.AudioListener()
  let audio = new THREE.Audio(listener)
  let audioLoader = new THREE.AudioLoader()
  audioLoader.load('./backgroundmusic.aac', (AudioBuffer) => {
    audio.setBuffer(AudioBuffer)
    audio.setVolume = "0.8"
    audio.play()
  })
}
function displayblock() {
  left.style.display = 'block'
  center.style.display = 'block'
  right.style.display = 'block'
  buttom.style.display = 'block'
}
function displaynone() {
  left.style.display = 'none'
  center.style.display = 'none'
  right.style.display = 'none'
  buttom.style.display = 'none'
}
function load() {
  window.addEventListener('resize', onWindowResize)
  left = document.querySelector("#left")
  center = document.querySelector("#center")
  right = document.querySelector("#right")
  buttom = document.querySelector("#buttom")
  overplay.remove()
  loading.remove()
  function CHUSHIHUA() {
    camera.position.set(-2, 6, -1.2)
    setTimeout(() => {
      displayblock()
    }, 1000);
    document.removeEventListener("click", CHUSHIHUA)
  }
  document.addEventListener("click", CHUSHIHUA)
}
// 当鼠标移动到特定区域之上
function dotmouseover() {
  left.onmouseover = function () {
    leftreact()
    movetodoor(pre_left, left, -2, 6, 15, 1500)
  }
  center.onmouseover = function () {
    centerreact()
    movetodoor(pre_center, center, -12, 6, -1.2, 1500)
  }
  right.onmouseover = function () {
    rightreact()
    movetodoor(pre_right, right, -2, 6, -15, 1500)
  }
  buttom.onmouseover = function () {
    buttomreact()
  }
}
// 回到床上时
function react_false() {
  pre_left = false
  pre_center = false
  pre_right = false
  pre_buttom = false
}
// kokotaqi传入的参数:摄像头,灯光去where,去的时间为多少
// 解释每次瞄到其他门时,将剩下门响应设为flase,当回到床上时所有响应为无
// 瞄到左门的响应
function leftreact() {
  tweenlighttarget(-2, 6, 16, 500)
  tweenposturn(-2, 6, 16, 300)
  react_false()
  pre_left = true
  kokotaqi = { x: -10, y: 6, z: 25, time: 1500 }
}
// 瞄到中门的响应
function centerreact() {
  tweenlighttarget(-100, 6, 0, 500)
  tweenposturn(-100, 6, 0, 300)
  react_false()
  pre_center = true
  kokotaqi = { x: -23.5, y: 5.7, z: -1.2, time: 1500 }
}
// 瞄到右门的响应
function rightreact() {
  tweenlighttarget(-2, 6, -16, 500)
  tweenposturn(-2, 6, -16, 300)
  react_false()
  pre_right = true
  kokotaqi = { x: -10, y: 6, z: -25, time: 1500 }
}
// 瞄到床后的响应
function buttomreact() {
  tweenlighttarget(20, 6, 0, 500)
  tweenposturn(20, 6, 0, 300)
  react_false()
  pre_buttom = true
  if (mob_inbuttom) {
    setTimeout(() => {
      clearTimeout(kill_time)
      mob_live = false
      mob_position_noappear = true
      mob_inbuttom = false
    }, 2000);
  }
}
// 嵌套
function tweencameraposition(x, y, z, time, which) {
  const tween = new TWEEN.Tween(camera.position)
  tween.to({ x: x, y: y, z: z }, time)
  tween.start()
  which.removeEventListener("click", tweencameraposition)
  // 当靠近门时候，back=ture，进入后续监听事件
  if (back) {
    setTimeout(() => {
      light = true
      closedoor = true
      document.addEventListener("click", backbed)
      document.addEventListener("keydown", keypress)
      document.addEventListener("keyup", keyup)
    }, 1500);
  }
}
// 当靠近门口并按下特定键时
// 按下键
function keypress(e) {
  if (e.key === 'e') { if (light) { light_() } }
  // 按r回避
  if (e.key === 'r') { if (closedoor) { closedoor_() } }
}
// 弹起键
function keyup(e) {
  if (e.key === 'e') {
    light_i = 0
    spotLight.intensity = '0.11'
    spotLight_.intensity = '0.03'
    closedoor = true
  }
  if (e.key === 'r') {
    setTimeout(() => {
      setTimeout(() => {
        light = true
      }, 800);
      closedoor_i = 0
      if (pre_center) {
        center_door_.stop()
        center_door__.stop()
        center_door___.stop()
        center_door____.stop()
        push_c_door.play()
      }
      if (pre_left || pre_right) {
        push_lf_door2.play()
        if (pre_left) {
          tweencameraposition_(-2, 6, 15, 800, pre_left)
          left_door.paused = false
        }
        if (pre_right) {
          tweencameraposition_(-2, 6, -15, 800, pre_right)
          right_door.paused = false
        }
      }
    }, 600);
  }
}
// ====================灯光封装====================
function light_() {
  if (light_i === 0) { turnonoffaudio.play() }
  light_i++
  spotLight.intensity = '6'
  spotLight_.intensity = '3'
  spotLight.distance = '40'
  spotLight_.distance = '40'
  closedoor = false
  // 如果这时开灯就会死
  if (pre_left) {
    if (mob_inleft) {
      mob_inleft_ = true
      gameover = setTimeout(() => {
        // 死亡
        Gameover_()
        clearTimeout(kill_time)
      }, 1000);
    }
  }
  if (pre_center) {
    if (mob_incenter) {
      mob_incenter_ = true
      gameover = setTimeout(() => {
        // 死亡
        Gameover_()
        clearTimeout(kill_time)
      }, 1000);
    }
  }
  if (pre_right) {
    if (mob_inright) {
      mob_inright_ = true
      gameover = setTimeout(() => {
        // 死亡
        Gameover_()
        clearTimeout(kill_time)
      }, 1000);
    }
  }
}
let closedoor_i = 0
let light_i = 0
// ====================关门封装====================
function closedoor_() {
  // 中门
  if (pre_center) {
    // 动画
    if (mob_incenter) {
      clearTimeout(gameover)
      clearTimeout(kill_time)
      mob_live = false
      mob_position_noappear = true
      mob_incenter = false
    }
    // 动画
    center_door_.play()
    center_door__.play()
    center_door___.play()
    center_door____.play()
    // 音效
    if (closedoor_i == 0) {
      setTimeout(() => {
        pull_c_door.play()
      }, 200);
    }
  }
  // 左右门
  if (pre_left || pre_right) {
    if (closedoor_i == 0) {
      // 再次刷怪
      if (pre_left) {
        if (mob_inleft) {
          clearTimeout(gameover)
          clearTimeout(kill_time)
          mob_live = false
          mob_position_noappear = true
          mob_inleft = false
        }
        // 动画
        left_door.stop()
        left_door.time = 0
        setTimeout(() => {
          left_door.paused = true
        }, 600);
        left_door.play()
        tweencameraposition_(-2, 6, 12, 500, pre_left)
      }
      // 再次刷怪
      if (pre_right) {
        if (mob_inright) {
          clearTimeout(gameover)
          clearTimeout(kill_time)
          mob_live = false
          mob_position_noappear = true
          mob_inright = false
        }
        // 动画
        right_door.stop()
        right_door.time = 0
        setTimeout(() => {
          right_door.paused = true
        }, 600);
        right_door.play()
        tweencameraposition_(-2, 6, -12, 500, pre_right)
      }
      // 音效
      setTimeout(() => {
        pull_lf_door.play()
      }, 200);
    }
  }
  closedoor_i++
  light = false
}
// ================================================================================
// 平滑摄像头位置
function tweencameraposition_(x, y, z, time) {
  const tween = new TWEEN.Tween(camera.position)
  tween.to({ x: x, y: y, z: z }, time)
  tween.start()
}
// 平滑灯光亮度
function tweenlight(intensity, time, which) {
  const light_tween = new TWEEN.Tween(which)
  light_tween.to({ intensity: intensity }, time)
  light_tween.start()
}
// 平滑灯光,由于要模拟光晕,有两个light
function tweenlighttarget(x, y, z, time) {
  const tween = new TWEEN.Tween(spotLight.target.position)
  tween.to({ x: x, y: y, z: z }, time)
  tween.start()
  const tween_ = new TWEEN.Tween(spotLight_.target.position)
  tween_.to({ x: x, y: y, z: z }, time)
  tween_.start()
}
// 摄像头瞄准位置
function tweenposturn(x, y, z, time) {
  const tween = new TWEEN.Tween(pos)
  tween.to({ x: x, y: y, z: z }, time)
  tween.start()
}
// ================================================================================
// 移动门口封装
function movetodoor(which, which_, x, y, z, time) {
  if (which) {
    which_.addEventListener("click", function () {
      walkdooraudio.play()
      if (pre_left || pre_right) {
        setTimeout(() => {
          tweenposturn(kokotaqi.x - 15, kokotaqi.y + 5, kokotaqi.z, kokotaqi.time - 800)
          tweenlighttarget(kokotaqi.x - 15, kokotaqi.y + 5, kokotaqi.z, kokotaqi.time - 800)
        }, 800);
        tweenposturn(kokotaqi.x - 10, kokotaqi.y - 200, kokotaqi.z, kokotaqi.time)
        tweenlighttarget(kokotaqi.x - 10, kokotaqi.y - 200, kokotaqi.z, kokotaqi.time)
        // 动画选择播放
        left_door.time = 1.3
        left_door.duration = 2.8
        right_door.time = 1.3
        right_door.duration = 2.8
        if (pre_left) {
          setTimeout(() => {
            push_lf_door.play()
            left_door.play()
          }, 1300);
        }
        if (pre_right) {
          setTimeout(() => {
            push_lf_door.play()
            right_door.play()
          }, 1300);
        }
      }
      if (pre_center) {
        setTimeout(() => {
          tweenposturn(kokotaqi.x - 10, kokotaqi.y - 10, kokotaqi.z, kokotaqi.time - 800)
          tweenlighttarget(kokotaqi.x - 10, kokotaqi.y - 10, kokotaqi.z, kokotaqi.time - 800)
        }, 800);
        tweenposturn(kokotaqi.x - 10, kokotaqi.y - 200, kokotaqi.z, kokotaqi.time)
        tweenlighttarget(kokotaqi.x - 10, kokotaqi.y - 200, kokotaqi.z, kokotaqi.time)
      }
      // 这back必须放这，否则有虫
      back = true
      tweencameraposition(x, y, z, time, which_)
      tweenlight(0.11, 200, spotLight)
      tweenlight(0.03, 200, spotLight_)
      displaynone()
    })
  }
}
// 当靠近门口并触发点击事件时
function backbed() {
  walkbedaudio.play()
  // 动画返回
  center_door_.stop()
  center_door__.stop()
  center_door___.stop()
  center_door____.stop()
  left_door.stop()
  right_door.stop()
  react_false()
  back = false
  spotLight.distance = '20'
  spotLight_.distance = '20'
  // 万众归于中心
  // 效果最好的参数设置
  setTimeout(() => {
    tweenlighttarget(-100, 6, 0, 500)
    tweenposturn(-100, 6, 0, 300)
  }, 1000);
  setTimeout(() => {
    tweenlighttarget(-2, 6, -1.2, 500)
    tweenposturn(-2, 6, -1.2, 300)
  }, 800);
  tweenlighttarget(-2, -100, -1.2, 500)
  tweenposturn(-2, -100, -1.2, 300)
  tweencameraposition_(-2, 6, -1.2)
  // 灯光调节
  setTimeout(() => {
    tweenlight(8, 500, spotLight)
    tweenlight(3, 500, spotLight_)
  }, 500);
  // 所有动画停止
  // 在返回1.5秒后重新开放点击事件
  setTimeout(() => {
    displayblock()
  }, 1500);
  // 移除所有事件
  document.removeEventListener("click", backbed)
  document.removeEventListener("keydown", keypress)
  document.removeEventListener("keyup", keyup)
}
// ========================================开发人员测试========================================
document.addEventListener("keydown", function (e) {
  if (e.key === 'o') {
    console.log("----------\n测试\n----------")
  }
})
// 目前进度，仍没有做回避时间
// ========================================关于怪物元素========================================
// 鬼闪灯
function mob_light() {
  const mob_light_times = setInterval(() => {
    scene.remove(ambient)
    if (pre_center || pre_buttom) {
      spotLight.intensity = 0.11
      spotLight_.intensity = 0.03
    }
    setTimeout(() => {
      scene.add(ambient)
      if (pre_center || pre_buttom) {
        spotLight.intensity = 8
        spotLight_.intensity = 3
      }
    }, Math.random() * 100 + 100);
  }, Math.random() * 100);
  setTimeout(() => {
    clearInterval(mob_light_times)
  }, 1000);
}
// 鬼生成函数
// 本游戏最难点，唯一需要停下来仔细思考的地方
// 首先怪物生成的点
// 左门：过道，过道预备 右门：过道，过道预备
// 当预备过道被闪时，怪直接返回原处，当在过道被闪时，GAMEOVER，除非关门挡怪，否则一直滞留
// 前门：只会吓一下，若长久不管时，则会跳杀，需要关门回避
// 床上：前门同前门，但回避方式改成灯光照射
// 所以一共有六个点位，但左右两个点位才细分成两个点位
function mob_create_in_time() {
  // 四处可以生成鬼
  // 每秒检测是否有鬼生成
  // 在钟声结束后开始执行函数
  setTimeout(() => {
    setInterval(() => {
      // 没鬼则生成
      if (!mob_live) {
        mob_create()
        atonce = true
      }
      if (atonce) {
        kill_time = setTimeout(() => {
          Gameover_()
        }, 8000);
        if (mob_position_ === mob_position[0]) {
          console.log("在左门")
          if (rate(1)) {
            setTimeout(() => {
              mob_appear.play()
            }, 200);
          }
          bear_walk.play()
          mob_inleft = true
        }
        if (mob_position_ === mob_position[1]) {
          console.log("在中门")
          if (rate(7)) { mob_appear.play() }
          mob_incenter = true
        }
        if (mob_position_ === mob_position[2]) {
          console.log("在右门")
          if (rate(1)) {
            setTimeout(() => {
              mob_appear.play()
            }, 200);
          }
          bear_walk.play()
          bear_left_to_right.play()
          mob_inright = true
        }
        if (mob_position_ === mob_position[3]) {
          console.log("在床上")
          if (rate(7)) { mob_appear.play() }
          mob_inbuttom = true
          mob_inbuttom_ = true
        }
        atonce = false
      }
    }, Math.random() * 30000 + 5000);
  }, 20000);
}
function mob_create() {
  // 待回避鬼后 ， mob_live变为false
  mob_live = true
  // 为了在列表中遍历
  var mob_i = Math.floor(Math.random() * 4)
  mob_position_ = mob_position[mob_i]
  // 那么鬼位置可能在前后左右各一处，若在走廊则要预备
}
function Gameover_() {
  mob_light()
  setTimeout(() => {
    document.body.removeChild(renderer.domElement)
    setTimeout(() => {
      document.querySelector("#gameover_block").style.display = "block"
      setTimeout(() => {
        GameoverAudio.play()
      }, 2000);
    }, 500);
    bear_kill.play()
  }, 1000);
}
function rate(how) {
  if (Math.random() * 10 < how) {
    return true
  }
  else {
    return false
  }
}
let time_i = 0
// ================================================================================
// 设置时间
function time_set() {
  document.querySelector("#time").innerHTML = time_i + ":00AM"
}
// 更改时间
function time_change() {
  time_set()
  setInterval(() => {
    time_i += 1
    time_set()
  }, 45000);
}