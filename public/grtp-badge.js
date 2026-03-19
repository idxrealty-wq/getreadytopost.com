(function () {
  const containers = document.querySelectorAll('[data-grtp-badge]');

  containers.forEach(function (container) {
    const verificationId = container.getAttribute('data-grtp-badge');
    if (!verificationId) return;

    fetch('https://getreadytopost.com/api/verification/badge?id=' + verificationId)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success || !data.record) {
          container.innerHTML =
            '<span style="font-family:sans-serif;font-size:12px;color:#888;">Verification unavailable</span>';
          return;
        }

        const r = data.record;
        const isApproved = r.status === 'approved';
        const isExpired = r.status === 'expired';
        const isPending = r.status === 'pending';

        const borderColor = isApproved ? '#10b981' : isPending ? '#f59e0b' : '#ef4444';
        const statusLabel = isApproved ? '✓ Verified' : isPending ? '⏳ Pending' : isExpired ? '⚠ Expired' : '✕ Denied';
        const lastVerified = r.lastVerifiedAt ? new Date(r.lastVerifiedAt).toLocaleDateString() : 'N/A';

        container.innerHTML =
          '<a href="' + r.publicRecordUrl + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;font-family:sans-serif;">' +
          '<div style="border:2px solid ' + borderColor + ';border-radius:12px;padding:12px 16px;background:rgba(0,0,0,0.85);color:#fff;min-width:200px;">' +
          '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:' + borderColor + ';margin-bottom:4px;">' + r.badgeLabel + '</div>' +
          '<div style="font-size:16px;font-weight:700;color:' + borderColor + ';">' + statusLabel + '</div>' +
          '<div style="font-size:12px;color:#ccc;margin-top:4px;">' + r.verifiedEntityName + ' &bull; ' + r.entityType + '</div>' +
          '<div style="font-size:11px;color:#888;margin-top:4px;">Last verified: ' + lastVerified + '</div>' +
          '<div style="font-size:10px;color:#555;margin-top:6px;">Powered by GetReadyToPost.com</div>' +
          '</div></a>';
      })
      .catch(function () {
        container.innerHTML =
          '<span style="font-family:sans-serif;font-size:12px;color:#888;">Verification unavailable</span>';
      });
  });
})();
