#
#    Copyright (c) 2009-2015 Tom Keffer <tkeffer@gmail.com>
#
#    See the file LICENSE.txt for your full rights.
#

"""User extensions module

This module is imported from the main executable, so anything put here will be
executed before anything else happens. This makes it a good place to put user
extensions.
"""

import locale
# This will use the locale specified by the environment variable 'LANG'
# Other options are possible. See:
# http://docs.python.org/2/library/locale.html#locale.setlocale
locale.setlocale(locale.LC_ALL, '')
import schemas.wview
schema_extended = schemas.wview.schema + [('uva', 'REAL'),('uvb', 'REAL'),('uvawm', 'REAL'),('uvbwm', 'REAL'),('avg_distance', 'REAL'),('lightning_strikes', 'REAL'),('energy', 'REAL'), ('full_spectrum', 'REAL'),('visible', 'REAL'),('infrared', 'REAL')]
import weewx.units
weewx.units.obs_group_dict['avg_distance'] = 'group_distance'
weewx.units.obs_group_dict['lightning_strikes'] = 'group_count'
weewx.units.default_unit_format_dict['count'] = '%.0f'
weewx.units.default_unit_label_dict['count'] = ''
weewx.units.obs_group_dict['energy'] = 'group_energy'
weewx.units.obs_group_dict['uva'] = 'group_uv'
weewx.units.obs_group_dict['uvb'] = 'group_uv'
weewx.units.obs_group_dict['uvawm'] = 'group_radiation'
weewx.units.obs_group_dict['uvbwm'] = 'group_radiation'
weewx.units.obs_group_dict['full_spectrum'] = 'group_uv'
weewx.units.obs_group_dict['visible'] = 'group_uv'
weewx.units.obs_group_dict['infrared'] = 'group_uv'

