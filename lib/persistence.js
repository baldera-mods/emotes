'use strict';

const Slash = require('slash');

const RETRY_TIME = 15;

module.exports = function persistence(base) {
  const dispatch = base.dispatch;
  const slash = new Slash(dispatch);

  let cid = { high: 0, low: 0 };
  let race = 0; // (0) human m/f, (2) high elf m/f, (4) aman m/f, (6) castanic m/f, (8) popori, (9) elin, (10) baraka
  let emote = 0;
  let emoted = false;
  let timer = null;

  function doEmote(emote) {
    clearTimeout(timer);
    if (emoted || emote === 0) return;
    if (emote < 43) {
      dispatch.toServer('cSocial', { emote: emote, unk: 0 });
    } else {
      const res = base.quickswap.doEmote(emote, true);
      switch (res) {
        case -1:
          // err
          emote = 0;
          break;
        case 0:
          timer = setTimeout(doEmote, RETRY_TIME, emote);
          break;
        case 1:
          break;
      }
    }
  };

  slash.on('force', function slash(args) {
    if (args.length < 2) {
      // err (usage)
      return;
    }

    switch (args[1].toLowerCase()) {
      case 'dance':
        emote = 21;
        break;
      case 'sit':
        emote = 38;
        break;
      case 'kitchen':
        if (race === 9) { // elin
          emote = 44;
        } else {
          // err
          return;
        }
        break;
      case 'settle':
        if (race === 1) { // human
          emote = 45;
        } else if (race === 3) { // high elf
          emote = 47;
        } else if (race === 7) { // castanic
          emote = 49;
        } else if (race === 9) { // elin
          emote = 51;
        } else {
          // err
          return;
        }
        break;
      default:
        // err
        return;
    }

    emoted = false;
    doEmote(emote);
  });

  dispatch.hook('sLogin', function sLogin(event) {
    cid = event.cid;
    race = Math.floor((event.model - 10101) / 100);
  });

  dispatch.hook('sEachSkillResult', function sEachSkillResult(event) {
    if (emote !== 0 && event.target.equals(cid)) {
      emoted = false;
      doEmote(emote);
    }
  });

  dispatch.hook('sSocial', function sSocial(event) {
    if (event.target.equals(cid) && event.animation === emote) {
      emoted = true;
    }
  });

  dispatch.hook('cCollectionPickStart', () => { emote = 0; });
  dispatch.hook('cPlayerLocation', () => { emote = 0; });
  dispatch.hook('cPressSkill', () => { emote = 0; }); // ???
  dispatch.hook('cSocial', () => { emote = 0; });
  dispatch.hook('cStartSkill', () => { emote = 0; });
  dispatch.hook('sLoadTopo', () => { emote = 0; });
  dispatch.hook('sReturnToLobby', () => { emote = 0; });
};
