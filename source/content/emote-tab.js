/* Added by Jabster28 | MIT Licensed */
/* Modified by UniQMG */
(async () => {
  if (window.location.pathname != '/') return;
  let storage = await getDataSourceForDomain(window.location);
  let { tetrioPlusEnabled } = await storage.get('tetrioPlusEnabled');
  if (!tetrioPlusEnabled) return;
  let res = await storage.get('enableEmoteTab');
  if (!res.enableEmoteTab) return;

  let url = `https://ch.tetr.io/api/users/${localStorage.userID}`;
  localStorage.chTetrioUser = await fetch(url)
    .then(r => r.json())
    .then(d => ({
      verified: d.data.user.verified,
      staff: d.data.user.role == 'staff',
      supporter: d.data.user.supporter_tier > 0
    }))
    .catch(ex => {
      console.warn('Failed to fetch usable emotes', ex);
      return { supporter: true, verified: true, staff: true };
    })
    .then(val => JSON.stringify(val));

  let script = document.createElement('script');
  script.src = browser.runtime.getURL('source/injected/emote-tab.js');
  document.head.appendChild(script);
})().catch(console.error);
