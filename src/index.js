import * as TowerCGServer from '@towercg/server';

import * as _ from 'lodash';
import * as elAPI from 'extra-life-api';

import { pluginReducer } from './reducer';

export class ExtraLifePlugin extends TowerCGServer.ServerPlugin {
  static pluginName = "extralife";
  static reducer = pluginReducer;
  static defaultConfig = { tickRate: 3000, logTicks: false, teams: {}, users: {} };

  async initialize() {
    this._refreshExtraLifeData = this._refreshExtraLifeData.bind(this);
    this._refreshUser = this._refreshUser.bind(this);
    this._refreshTeam = this._refreshTeam.bind(this);

    this.logger.info(`Setting Extra Life API poll for every ${this.pluginConfig.tickRate}ms.`);

    this._refreshExtraLifeData();
    setInterval(() => this._refreshExtraLifeData(), this.pluginConfig.tickRate);
  }

  async _refreshExtraLifeData() {
    const teamAwaiters = _.mapValues(this.pluginConfig.teams, (v, k) => this._refreshTeam(k, v));
    const userAwaiters = _.mapValues(this.pluginConfig.users, (v, k) => this._refreshUser(k, v));

    await Promise.all(
      Object.values(teamAwaiters).concat(Object.values(userAwaiters))
    );
    this.logger.debug("Completed all polls.");
  }

  async _refreshUser(key, userId) {
    this.logger.trace({ userKey: key, userId }, "beginning poll for user.");

    const payloadAwait = elAPI.getUserInfo(userId);
    const donationsAwait = elAPI.getRecentDonations(userId, 0);

    const payload = await payloadAwait;
    payload.donations = await donationsAwait;

    this.logger.trace({ userKey: key, userId }, "poll completed for user.");
    this.dispatch({ type: "extralife.updateUser", key, payload });

    return payload;
  }

  async _refreshTeam(key, teamId) {
    this.logger.trace({ teamKey: key, teamId }, "beginning poll for team.");
    const payload = await elAPI.getTeamInfo(teamId, false);

    this.logger.trace({ teamKey: key, teamId }, "poll completed for team.");
    this.dispatch({ type: "extralife.updateTeam", key, payload });

    return payload;
  }
}
