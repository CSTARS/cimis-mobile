module.exports = {
  'ETo' : {
    params : ['day_asce_eto'],
    units : 'mm'
  },
  'Precip' : {
    params : ['day_precip'],
    units : 'mm'
  },
  'Avg Solar Radiation' : {
    params : ['day_sol_rad_avg'],
    units : 'W/m^2'
  },
  'Avg Vapor Presure' : {
    params : ['day_vap_pres_avg'],
    units : 'kPa'
  },
  'Temperature/Dewpoint' : {
    params : ['day_air_tmp_max', 'day_air_tmp_min', 
              'day_air_tmp_avg', 'day_dew_pnt'],
    units : 'C'
  },
  'Humidity' : {
    params : ['day_rel_hum_max', 'day_rel_hum_min', 
              'day_rel_hum_avg'],
    units : '%'
  },
  'Avg Wind Speed' : {
    params : ['day_wind_spd_avg'],
    units : 'm/s'
  }
}