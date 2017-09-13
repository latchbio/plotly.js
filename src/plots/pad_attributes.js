/**
* Copyright 2012-2017, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

// This is used exclusively by components inside component arrays,
module.exports = {
    t: {
        valType: 'number',
        dflt: 0,
        role: 'style',
        editType: 'doarraydraw',
        description: 'The amount of padding (in px) along the top of the component.'
    },
    r: {
        valType: 'number',
        dflt: 0,
        role: 'style',
        editType: 'doarraydraw',
        description: 'The amount of padding (in px) on the right side of the component.'
    },
    b: {
        valType: 'number',
        dflt: 0,
        role: 'style',
        editType: 'doarraydraw',
        description: 'The amount of padding (in px) along the bottom of the component.'
    },
    l: {
        valType: 'number',
        dflt: 0,
        role: 'style',
        editType: 'doarraydraw',
        description: 'The amount of padding (in px) on the left side of the component.'
    },
    editType: 'doarraydraw'
};
