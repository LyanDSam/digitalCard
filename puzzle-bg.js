(function () {
  'use strict';
  var S = 150, T = 22; // Bigger pieces

  var COLORS = [
    { light: '#1e4a7a', dark: '#0e2a4a', stroke: 'rgba(80,160,255,0.22)' },
    { light: '#1a5280', dark: '#0c2e4e', stroke: 'rgba(56,189,248,0.20)' },
    { light: '#243e78', dark: '#101e48', stroke: 'rgba(99,120,241,0.22)' },
    { light: '#1b4d80', dark: '#0d2d4c', stroke: 'rgba(40,180,233,0.20)' },
    { light: '#1f4878', dark: '#0f284a', stroke: 'rgba(50,200,220,0.20)' },
    { light: '#2a3c70', dark: '#121c40', stroke: 'rgba(90,100,229,0.20)' },
  ];

  function edge(x1, y1, x2, y2, dir, nx, ny) {
    if (dir === 0) return 'L ' + x2 + ' ' + y2 + ' ';
    var t = T * dir, dx = x2 - x1, dy = y2 - y1;
    var p1x = x1 + dx * 0.34, p1y = y1 + dy * 0.34;
    var p5x = x1 + dx * 0.66, p5y = y1 + dy * 0.66;
    var nn = t * 0.1, hp = t;
    return 'L ' + p1x + ' ' + p1y + ' ' +
      'C ' + (p1x + nx * (-nn)) + ' ' + (p1y + ny * (-nn)) + ',' +
      (p1x + dx * 0.04 + nx * hp * 0.6) + ' ' + (p1y + dy * 0.04 + ny * hp * 0.6) + ',' +
      (x1 + dx * 0.40 + nx * hp * 0.85) + ' ' + (y1 + dy * 0.40 + ny * hp * 0.85) + ' ' +
      'C ' + (x1 + dx * 0.44 + nx * hp * 1.1) + ' ' + (y1 + dy * 0.44 + ny * hp * 1.1) + ',' +
      (x1 + dx * 0.56 + nx * hp * 1.1) + ' ' + (y1 + dy * 0.56 + ny * hp * 1.1) + ',' +
      (x1 + dx * 0.60 + nx * hp * 0.85) + ' ' + (y1 + dy * 0.60 + ny * hp * 0.85) + ' ' +
      'C ' + (p5x - dx * 0.04 + nx * hp * 0.6) + ' ' + (p5y - dy * 0.04 + ny * hp * 0.6) + ',' +
      (p5x + nx * (-nn)) + ' ' + (p5y + ny * (-nn)) + ',' +
      p5x + ' ' + p5y + ' L ' + x2 + ' ' + y2 + ' ';
  }

  function init() {
    var c = document.querySelector('.puzzle-bg');
    if (!c) return;
    c.innerHTML = '';
    var vw = window.innerWidth, vh = window.innerHeight;
    var cols = Math.ceil(vw / S) + 1, rows = Math.ceil(vh / S) + 1;
    var ns = 'http://www.w3.org/2000/svg';

    var hE = [], vE = [], r, col;
    for (r = 0; r <= rows; r++) {
      hE[r] = [];
      for (col = 0; col < cols; col++)
        hE[r][col] = (r === 0 || r === rows) ? 0 : (Math.random() > 0.5 ? 1 : -1);
    }
    for (r = 0; r < rows; r++) {
      vE[r] = [];
      for (col = 0; col <= cols; col++)
        vE[r][col] = (col === 0 || col === cols) ? 0 : (Math.random() > 0.5 ? 1 : -1);
    }

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', vw);
    svg.setAttribute('height', vh);
    svg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%';

    var defs = document.createElementNS(ns, 'defs');
    COLORS.forEach(function (color, i) {
      var grad = document.createElementNS(ns, 'linearGradient');
      grad.setAttribute('id', 'grad' + i);
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
      var s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', color.light);
      grad.appendChild(s1);
      var s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', color.dark);
      grad.appendChild(s2);
      defs.appendChild(grad);
    });
    svg.appendChild(defs);

    var grid = [];
    var totalPieces = rows * cols;

    for (r = 0; r < rows; r++) {
      grid[r] = [];
      for (col = 0; col < cols; col++) {
        var x = col * S, y = r * S;
        var top = -hE[r][col], bot = hE[r + 1][col];
        var lft = -vE[r][col], rgt = vE[r][col + 1];

        var d = 'M ' + x + ' ' + y + ' ';
        d += edge(x, y, x + S, y, top, 0, -1);
        d += edge(x + S, y, x + S, y + S, rgt, 1, 0);
        d += edge(x + S, y + S, x, y + S, bot, 0, 1);
        d += edge(x, y + S, x, y, lft, -1, 0);
        d += 'Z';

        var ci = (r * 7 + col * 3) % COLORS.length;
        var color = COLORS[ci];

        var inner = document.createElementNS(ns, 'g');
        inner.classList.add('jigsaw-piece');
        inner.style.transformOrigin = (x + S / 2) + 'px ' + (y + S / 2) + 'px';
        inner.dataset.row = r;
        inner.dataset.col = col;

        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d);
        p.setAttribute('fill', 'url(#grad' + ci + ')');
        p.setAttribute('stroke', color.stroke);
        p.setAttribute('stroke-width', '1.2');
        inner.appendChild(p);

        // Top-left highlight bevel
        var highlight = document.createElementNS(ns, 'path');
        highlight.setAttribute('d', d);
        highlight.setAttribute('fill', 'none');
        highlight.setAttribute('stroke', 'rgba(150,210,255,0.08)');
        highlight.setAttribute('stroke-width', '2');
        highlight.style.pointerEvents = 'none';
        inner.appendChild(highlight);

        svg.appendChild(inner);
        grid[r][col] = inner;
      }
    }

    c.appendChild(svg);

    // Hover with neighbor propagation
    var activeEls = [];

    function clearActive() {
      for (var i = 0; i < activeEls.length; i++) {
        activeEls[i].classList.remove('jigsaw-hover', 'jigsaw-near', 'jigsaw-far');
      }
      activeEls = [];
    }

    function applyHover(row, col) {
      clearActive();
      if (grid[row] && grid[row][col]) {
        grid[row][col].classList.add('jigsaw-hover');
        svg.appendChild(grid[row][col]);
        activeEls.push(grid[row][col]);
      }
      var near = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (var i = 0; i < near.length; i++) {
        var nr = row + near[i][0], nc = col + near[i][1];
        if (grid[nr] && grid[nr][nc]) {
          grid[nr][nc].classList.add('jigsaw-near');
          svg.appendChild(grid[nr][nc]);
          activeEls.push(grid[nr][nc]);
        }
      }
      var far = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (var j = 0; j < far.length; j++) {
        var fr = row + far[j][0], fc = col + far[j][1];
        if (grid[fr] && grid[fr][fc]) {
          grid[fr][fc].classList.add('jigsaw-far');
          svg.appendChild(grid[fr][fc]);
          activeEls.push(grid[fr][fc]);
        }
      }
      if (grid[row] && grid[row][col]) svg.appendChild(grid[row][col]);
    }

    svg.addEventListener('mouseover', function (e) {
      var piece = e.target.closest('.jigsaw-piece');
      if (!piece) return;
      applyHover(parseInt(piece.dataset.row), parseInt(piece.dataset.col));
    });
    svg.addEventListener('mouseleave', function () { clearActive(); });
  }

  var tm;
  window.addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(init, 300); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
