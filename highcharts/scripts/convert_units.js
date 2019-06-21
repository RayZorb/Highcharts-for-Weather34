// function to convert temp
function convert_temp(source, dest, fields, fixed = 2){
   dest = dest.replace(/[^\x00-\x7F]/g, "").trim();
   source = source.replace(/[^\x00-\x7F]/g, "").trim();
   if (source == dest) return fields;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            fields.data[i][j] = do_temp_conversion(source, dest, fields.data[i][j], fixed);
   }else if (Array.isArray(fields)){
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            fields[i][j] = do_temp_conversion(source, dest, fields[i][j], fixed);
   }else
      return do_temp_conversion(source, dest, fields, fixed);
   console.log(fields);
   return fields;
}

function do_temp_conversion(source, dest, data, fixed){
   if (source == 'C')      return parseFloat((data * (9 / 5) + 32).toFixed(fixed));
   else if (source == 'F') return parseFloat(((data - 32) * 5 / 9).toFixed(fixed));
   return data;
}

//function to convert wind 
function convert_wind(source, dest, fields, fixed = 2){
   dest = dest.replace("hr","h").trim();
   source = source.replace("hr","h").trim();
   if (dest == source) return fields;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
           fields.data[i][j] = do_speed_conversion(source, dest, fields.data[i][j], fixed);
   }else if (Array.isArray(fields)){
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            fields[i][j] = do_speed_conversion(source, dest, fields[i][j], fixed);
   }else
      return do_speed_conversion(source, dest, fields, fixed);
   return fields;
}

function do_speed_conversion(source, dest, data, fixed){
   if (source == 'mph'  && dest == 'm/s')       return parseFloat((data * 0.44704).toFixed(fixed));
   else if (source == 'mph'  && dest == 'km/h') return parseFloat((data * 1.609344).toFixed(fixed));
   else if (source == 'm/s'  && dest == 'mph')  return parseFloat((data * 2.23694).toFixed(fixed));
   else if (source == 'm/s'  && dest == 'km/h') return parseFloat((data * 3.6).toFixed(fixed)); 
   else if (source == 'km/h' && dest == 'mph')  return parseFloat((data * 0.621371).toFixed(fixed));
   else if (source == 'km/h' && dest == 'm/s')  return parseFloat((data * 0.277778).toFixed(fixed));
   return data;
}

//function to convert pressure 
function convert_pressure(source, dest, fields, fixed = 2){
   dest = dest.trim();
   source = source.trim();
   //console.log(fields);
   if (dest == source) return fields;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            fields.data[i][j] = do_pressure_conversion(source, dest, fields.data[i][j], fixed);
   }else if (Array.isArray(fields)){
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            fields[i][j] = do_pressure_conversion(source, dest, fields[i][j], fixed);
   }else
      return do_pressure_conversion(source, dest, fields, fixed);
   return fields;
}

function do_pressure_conversion(source, dest, data, fixed){
   if (source == 'inHg' && dest == 'hPa')       return parseFloat((data * 33.8639).toFixed(fixed));
   else if (source == 'inHg' && dest == 'mb')   return parseFloat((data * 33.8639).toFixed(fixed));
   else if (source == 'hPa'  && dest == 'inHg') return parseFloat((data * 0.02953).toFixed(fixed));
   else if (source == 'hPa'  && dest == 'mb')   return parseFloat(data.toFixed(fixed));
   else if (source == 'mb'   && dest == 'inHg') return parseFloat((data * 0.02953).toFixed(fixed));
   else if (source == 'mb'   && dest == 'hPa')  return parseFloat((data).toFixed(fixed));
   return data;
}

//function to convert rain 
function convert_rain(source, dest, fields, fixed = 2){
   dest = dest.replace("inch","in").trim();
   source = source.replace("inch","in").trim();
   if (source == dest) return fields;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            fields.data[i][j] = do_distance_conversion(source, dest, fields.data[i][j], fixed);
   }else if (Array.isArray(fields)){
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            fields[i][j] = do_distance_conversion(source, dest, fields[i][j], fixed);
   }else
      return do_distance_conversion(source, dest, fields, fixed);
   return fields;
}

function do_distance_conversion(source, dest, data, fixed){
   if (source == 'in')      return parseFloat((data * 25.4).toFixed(fixed));
   else if (source == 'mm') return parseFloat((data * 0.0393701).toFixed(fixed));
   return data;
}
