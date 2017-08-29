import { InjectionToken } from '@angular/core';

export type State = any;
export const InitialState = new InjectionToken<State>('InitialState');
