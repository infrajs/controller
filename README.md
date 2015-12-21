# infrajs
Controller infrajs

## 1 октября 2015

* Обновлённый каталог с универсальным фильтром
* ~ синоним infra/data/
* Управление кэшем no-cache или no-store
* Тесты
* Добавлены тесты javascript infra.test('plugin')
* layer.seojson
* Используется репозитарий GIT и composer для сборки проекта и всех зависимостей
* Роли test debug admin
* docx убраны {env:company}
* Изменение конфига обновляет кэш
* файл infra/data/update отмечает заход админа и иницирует обновлние кэша infra-update:OK


Контроллер все расширения подключает автоматически. Уже есть вызов Config::get();