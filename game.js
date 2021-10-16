import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import { WEBGL } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/controls/OrbitControls.js';
import {graphics} from './graphics.js';

export const game = (function() {
  return {
    Game: class {                          // Параметр, который задает объект игры
      constructor() {
        this._Initialize();
      }

      _Initialize() {
        this._graphics = new graphics.Graphics(this);             // Создаем объект для обработки графики
        if (!this._graphics.Initialize()) {
          this._DisplayError('WebGL2 is not available.');
          return;
        }

        this._controls = this._CreateControls();      // Создаем контроллеры (чтобы пользователь мог взаимодействовать со сценой)
        this._previousRAF = null;

        this._OnInitialize();
        this._RAF();
      }

      _CreateControls() {
        const controls = new OrbitControls(          // Добавляем контроллер, чтобы пользователь мог вращать сцену мышью
            this._graphics._camera, this._graphics._threejs.domElement);
        controls.target.set(0, 0, 0);
        controls.update();
        return controls;
      }

      _DisplayError(errorText) {
        const error = document.getElementById('error');   // Добавляем на html страницу сообщение об ошибке
        error.innerText = errorText;
      }

      _RAF() {
        // Встроенный метод для более плавной анимации. Вместо того, чтобы вызывать новые кадры каждый интервал ровно
        // Кадры вызываются каждый раз, когда браузер готов к перерисовке.
        // В первую очередь это сделано для более плавной анимации, потому что не всегда анимационные кадры готовы к отрисовке
        // ровно в интервал
        requestAnimationFrame((t) => {    // Вызываем метод, который говорит браузеру о том, что мы хотим выполнить анимацию
          if (this._previousRAF === null) {
            this._previousRAF = t;
          }
          this._Render(t - this._previousRAF);
          this._previousRAF = t;
        });
      }

      // Рендерим сцену
      _Render(timeInMS) {
        const timeInSeconds = timeInMS * 0.001;
        this._OnStep(timeInSeconds);
        this._graphics.Render();

        this._RAF();
      }
    }
  };
})();
