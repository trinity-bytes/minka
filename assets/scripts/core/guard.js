(function () {
  "use strict";
  if (!window.Session) return;
  Session.requireAuth();
  Session.armInactivity(function () {
    Session.clearSession();
    location.href = "auth.html?reason=inactivity";
  });
})();
