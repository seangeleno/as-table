"use strict";

const

O = Object,

limit = (s, n) => s && ((s.length <= n) ? s : (s.substr (0, n - 1) + '…')),

asColumns = (rows, cfg_) => {
    
    if (rows.length === 0) {
        return [] }

    else { const

        zip = (arrs, f) => arrs.reduce ((a, b) => b.map ((b, i) => [...a[i] || [], b]), []).map (args => f (...args)),

    /*  Convert cell data to string (converting multiline text to singleline) */

        cells           = rows.map (r => r.map (c => (c === undefined) ? '' : cfg_.print (c).replace (/\n/g, '\\n'))),

    /*  Compute column widths (per row) and max widths (per column)     */

        cellWidths      = cells.map (r => r.map (c => c.length)),
        maxWidths       = zip (cellWidths, Math.max),

    /*  Default config     */

        cfg             = O.assign ({
                            delimiter: '  ',
                            minColumnWidths: maxWidths.map (x => 0),
                            maxTotalWidth: 0 }, cfg_),

    /*  Project desired column widths, taking maxTotalWidth and minColumnWidths in account.     */

        totalWidth      = maxWidths.reduce ((a, b) => a + b, 0),
        relativeWidths  = maxWidths.map (w => w / totalWidth),
        maxTotalWidth   = cfg.maxTotalWidth - (cfg.delimiter.length * (maxWidths.length - 1)),
        excessWidth     = Math.max (0, totalWidth - maxTotalWidth),
        computedWidths  = zip ([cfg.minColumnWidths, maxWidths, relativeWidths],
                            (min, max, relative) => Math.max (min, Math.floor (max - excessWidth * relative))),

    /*  This is how many symbols we should pad or cut (per column).  */

        restCellWidths  = cellWidths.map (widths => zip ([computedWidths, widths], (a, b) => a - b))

    /*  Perform final composition.   */

        return zip ([cells, restCellWidths], (a, b) =>
                zip ([a, b], (str, w) => (w >= 0)
                                            ? (str + ' '.repeat (w))
                                            : (limit (str, str.length + w))).join (cfg.delimiter))
    }
},

asTable = cfg => O.assign (arr => {

/*  Print arrays  */

    if (arr[0] && Array.isArray (arr[0]))
        return asColumns (arr, cfg).join ('\n')

/*  Print objects   */

    const colNames        = [...new Set ([].concat (...arr.map (O.keys)))],
          columns         = [colNames, ...arr.map (o => colNames.map (key => o[key]))],
          lines           = asColumns (columns, cfg)

    return [lines[0], '-'.repeat (lines[0].length), ...lines.slice (1)].join ('\n')

}, cfg, {

    configure: newConfig => asTable (O.assign ({}, cfg, newConfig)),
})

module.exports = asTable ({ maxTotalWidth: Number.MAX_SAFE_INTEGER, print: String })


