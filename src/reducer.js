import { combineReducers } from 'redux';

import * as TowerCGServer from '@towercg/server';

console.log(TowerCGServer);

const teams = TowerCGServer.ReducerHelpers.keyedSetter("extralife.updateTeam", "extralife.clearTeam");
const users = TowerCGServer.ReducerHelpers.keyedSetter("extralife.updateUser", "extralife.clearUser");

export const pluginReducer = combineReducers({
  users,
  teams
});
