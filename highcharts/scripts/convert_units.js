// function to convert temp
function convert_temp(source, dest, fields){
   dest = dest.replace(/[^\x00-\x7F]/g, "").trim();
   source = source.replace(/[^\x00-\x7F]/g, "").trim();
   if (source == dest) return fields;
   var i, j;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            if (source == 'C') fields.data[i][j] = parseFloat((fields.data[i][j] * (9 / 5) + 32).toFixed(2));
            else if (source == 'F') fields.data[i][j] = parseFloat(((fields.data[i][j] - 32) * 5 / 9).toFixed(2));
   }else
      for (i = 0; i < fields.length -1; i++)
         for (j = 1; j < fields[i].length; j++)
            if (source == 'C') fields[i][j] = parseFloat((fields[i][j] * (9 / 5) + 32).toFixed(2));
            else if (source == 'F') fields[i][j] = parseFloat(((fields[i][j] - 32) * 5 / 9).toFixed(2));
   return fields;
}

//function to convert wind 
function convert_wind(source, dest, fields){
   dest = dest.replace("hr","h").trim();
   source = source.replace("hr","h").trim();
   if (dest == source) return fields;
   var i;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
           if (source == 'mph'  && dest == 'm/s') fields.data[i][j] = parseFloat((fields.data[i][1] * 0.44704).toFixed(2));
           else if (source == 'mph'  && dest == 'km/h') fields.data[i][j] = parseFloat((fields.data[i][j] * 1.609344).toFixed(2));
           else if (source == 'm/s'  && dest == 'mph')  fields.data[i][j] = parseFloat((fields.data[i][j] * 2.23694).toFixed(2));
           else if (source == 'm/s'  && dest == 'km/h') fields.data[i][j] = parseFloat((fields.data[i][j] * 3.6).toFixed(2)); 
           else if (source == 'km/h' && dest == 'mph')  fields.data[i][j] = parseFloat((fields.data[i][j] * 0.621371).toFixed(2));
           else if (source == 'km/h' && dest == 'm/s')  fields.data[i][j] = parseFloat((fields.data[i][j] * 0.277778).toFixed(2));
   }else
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            if (source == 'mph'  && dest == 'm/s') fields[i][j] = parseFloat((fields[i][j] * 0.44704).toFixed(2));
            else if (source == 'mph'  && dest == 'km/h') fields[i][j] = parseFloat((fields[i][j] * 1.609344).toFixed(2));
            else if (source == 'm/s'  && dest == 'mph')  fields[i][j] = parseFloat((fields[i][j] * 2.23694).toFixed(2));
            else if (source == 'm/s'  && dest == 'km/h') fields[i][j] = parseFloat((fields[i][j] * 3.6).toFixed(2)); 
            else if (source == 'km/h' && dest == 'mph')  fields[i][j] = parseFloat((fields[i][j] * 0.621371).toFixed(2));
            else if (source == 'km/h' && dest == 'm/s')  fields[i][j] = parseFloat((fields[i][j] * 0.277778).toFixed(2));
   return fields;
}

//function to convert pressure 
function convert_pressure(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (dest == source) return fields;
   var i;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            if (source == 'inHg' && dest == 'hPa')  fields.data[i][j] = parseFloat((fields.data[i][j] * 33.8639).toFixed(2));
            else if (source == 'inHg' && dest == 'mb')   fields.data[i][j] = parseFloat((fields.data[i][j] * 33.8639).toFixed(2));
            else if (source == 'hPa'  && dest == 'inHg') fields.data[i][j] = parseFloat((fields.data[i][j] * 0.02953).toFixed(2));
            else if (source == 'hPa'  && dest == 'mb')   fields.data[i][j] = parseFloat((fields.data[i][j]).toFixed(2));
            else if (source == 'mb'   && dest == 'inHg') fields.data[i][j] = parseFloat((fields.data[i][j] * 0.02953).toFixed(2));
            else if (source == 'mb'   && dest == 'hPa')  fields.data[i][j] = parseFloat((fields.data[i][j]).toFixed(2));
   }else
      for (i = 0; i < fields.length; i++)
         for (j = 1; j < fields[i].length; j++)
            if (source == 'inHg' && dest == 'hPa')  fields[i][1] = parseFloat((fields[i][j] * 33.8639).toFixed(2));
            else if (source == 'inHg' && dest == 'mb')   fields[i][j] = parseFloat((fields[i][j] * 33.8639).toFixed(2));
            else if (source == 'hPa'  && dest == 'inHg') fields[i][j] = parseFloat((fields[i][j] * 0.02953).toFixed(2));
            else if (source == 'hPa'  && dest == 'mb')   fields[i][j] = parseFloat((fields[i][j]).toFixed(2));
            else if (source == 'mb'   && dest == 'inHg') fields[i][j] = parseFloat((fields[i][j] * 0.02953).toFixed(2));
            else if (source == 'mb'   && dest == 'hPa')  fields[i][j] = parseFloat((fields[i][j]).toFixed(2));
   return fields;
}

//function to convert rain 
function convert_rain(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (source == dest) return fields;
   var i;
   if (fields.hasOwnProperty('data')){
      for (i = 0; i < fields.data.length; i++)
         for (j = 1; j < fields.data[i].length; j++)
            if (source == 'in') fields.data[i][j] = parseFloat((fields.data[i][j] * 25.4).toFixed(2));
            else if (source == 'mm') fields.data[i][j] = parseFloat((fields.data[i][j] * 0.0393701).toFixed(2));
   }else
      for (i = 0; i < fields.length -1; i++)
         for (j = 1; j < fields[i].length; j++)
            if (source == 'in') fields[i][j] = parseFloat((fields[i][j] * 25.4).toFixed(2));
            else if (source == 'mm') fields[i][j] = parseFloat((fields[i][j] * 0.0393701).toFixed(2));
   return fields;
}
