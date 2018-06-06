import {APP_BASE_HREF} from '@angular/common';
import {provide} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppComponent} from './app.component';

bootstrap(AppComponent,[
    HTTP_PROVIDERS,
    provide(APP_BASE_HREF, {useValue:'<%= APP_BASE %>'})
]);