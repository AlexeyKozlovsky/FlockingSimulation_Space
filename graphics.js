import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/stats.module.js';
import {WEBGL} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js';
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/RenderPass.js';
import {GlitchPass } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/GlitchPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/UnrealBloomPass.js';

export const graphics = (function() {
  return {
    PostFX: {                             // Элементы для постобработки (постэффектов) графики
      UnrealBloomPass: UnrealBloomPass,   // Эффект bloom для имитации размытости света на ярких краях сцены
      GlitchPass: GlitchPass,             // Для добавления "неожиданной поломки" (как будто теряется видесигнал на короткое время)
    },
    Graphics: class {                     // Элемент с классом, который отвечает за графику
      constructor(game) {
      }

      Initialize() {
        if (!WEBGL.isWebGL2Available()) {
          return false;
        }

        this._threejs = new THREE.WebGLRenderer({           // Объявляем отрисовщик
            antialias: true,                          // Указываем, чтобы осуществлялось сглаживание
        });
        this._threejs.shadowMap.enabled = true;       // Включаем отрисовку теней с помощью теневой карты
        // Далее задаем тип теневой карты. Делаем так, чтобы тени рендерились по алгоритмы PCF (Percentage Closer Filtering).
        // Этот метод позволяет сгладить тени
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);         // Устанавливаем разрешение канваса
        this._threejs.setSize(window.innerWidth, window.innerHeight); // Устанавливаем размер канваса

        const target = document.getElementById('target'); // Ищем тег target
        target.appendChild(this._threejs.domElement);       // Добавляем канвас, где будет все рендерится

        this._stats = new Stats();                      // Создаем объект для хранения характеристик
				target.appendChild(this._stats.dom);    // Добавляем отображение характеристик на html страницу

        // Добавляем Listener, чтобы при изменении размеров окна менялся и размер канваса
        window.addEventListener('resize', () => {
          this._OnWindowResize();
        }, false);

        const fov = 60;             // Угол обзора камеры до ближайшей видимой плоскости
        const aspect = 1920 / 1080; // Разрешение камеры
        const near = 1.0;           // Расстояние до ближайшей плоскости
        const far = 1000.0;         // Расстояние до самой дальней плоскости
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);     // Создаем объект камеры
        this._camera.position.set(75, 20, 0);       // Указываем позицию камеры

        this._scene = new THREE.Scene();        // Создаем сцену

        this._CreateLights();       // Создаем освещение

        const composer = new EffectComposer(this._threejs);     // Создаем объект для реализации постобработки
        this._composer = composer;
        this._composer.addPass(new RenderPass(this._scene, this._camera));

        return true;
      }

      _CreateLights() {
        let light = new THREE.DirectionalLight(0xFFFFFF, 1, 100);     // Задаем направленный свет
        light.position.set(100, 100, 100);            // Устанавливаем положение источника света
        light.target.position.set(0, 0, 0);           // Устанавливаем цель
        light.castShadow = true;                      // Устанавливаем, что объекты, на которые падает свет могут отбрасывать тени
        light.shadowCameraVisible = true;
        light.shadow.bias = -0.01;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = 200;
        light.shadow.camera.right = -200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        this._scene.add(light);                     // Добавляем источник на сцену

        light = new THREE.DirectionalLight(0x404040, 1, 100);   // Создаем навпраленный источник света
        light.position.set(-100, 100, -100);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        this._scene.add(light);

        light = new THREE.DirectionalLight(0x404040, 1, 100);
        light.position.set(100, 100, -100);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        this._scene.add(light);
      }

      AddPostFX(passClass, params) {
        const pass = new passClass();     // Создаем объект для постобработки
        for (const k in params) {         // Присвяиваем ему параметры
          pass[k] = params[k];
        }
        this._composer.addPass(pass);     // Добавляем пасс в цепь обработки
        return pass;
      }

      _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;       // Меняем разрешение камеры
        this._camera.updateProjectionMatrix();    // Обновляем матрицу проекции камеры (надо вызывать после каждого изменения параметров камеры)
        this._threejs.setSize(window.innerWidth, window.innerHeight);     // Меняем размер отрисовщика
        this._composer.setSize(window.innerWidth, window.innerHeight);    // Меняем размер цепи объектов для постобработки
      }

      // Геттер для сцены
      get Scene() {
        return this._scene;
      }

      Render() {
        this._composer.render();      // Рендерим сцену
        this._stats.update();         // Обновляем характеристики
      }
    }
  };
})();
