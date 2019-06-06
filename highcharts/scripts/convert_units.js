// function to convert temp
function convert_temp(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (source == dest) return fields;
   var i;
   for (i = 0; i < fields.data.length; i++) { 
     if (source == 'C') fields.data[i][1] = parseFloat((fields.data[i][1] * (9 / 5) + 32).toFixed(2));
     else if (source == 'F') fields.data[i][1] = parseFloat(((fields.data[i][1] - 32) * 5 / 9).toFixed(2));
   }
   return fields;
}

//function to convert wind 
function convert_wind(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (dest == source) return fields;
   var i;
   for (i = 0; i < fields.data.length; i++) { 
       if (source == 'mph'  && dest == 'm/s') fields.data[i][1] = parseFloat((fields.data[i][1] * 0.44704).toFixed(2));
       else if (source == 'mph'  && dest == 'km/h') fields.data[i][1] = parseFloat((fields.data[i][1] * 1.609344).toFixed(2));
       else if (source == 'm/s'  && dest == 'mph')  fields.data[i][1] = parseFloat((fields.data[i][1] * 2.23694).toFixed(2));
       else if (source == 'm/s'  && dest == 'km/h') fields.data[i][1] = parseFloat((fields.data[i][1] * 3.6).toFixed(2)); 
       else if (source == 'km/h' && dest == 'mph')  fields.data[i][1] = parseFloat((fields.data[i][1] * 0.621371).toFixed(2));
       else if (source == 'km/h' && dest == 'm/s')  fields.data[i][1] = parseFloat((fields.data[i][1] * 0.277778).toFixed(2));
   }
   return fields;
}

//function to convert pressure 
function convert_pressure(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (dest == source) return fields;
   var i;
   for (i = 0; i < fields.data.length; i++) { 
       if (source == 'inHg' && dest == 'hPa')  fields.data[i][1] = parseFloat((fields.data[i][1] * 33.8639).toFixed(2));
       else if (source == 'inHg' && dest == 'mb')   fields.data[i][1] = parseFloat((fields.data[i][1] * 33.8639).toFixed(2));
       else if (source == 'hPa'  && dest == 'inHg') fields.data[i][1] = parseFloat((fields.data[i][1] * 0.02953).toFixed(2));
       else if (source == 'hPa'  && dest == 'mb')   fields.data[i][1] = parseFloat((fields.data[i][1]).toFixed(2));
       else if (source == 'mb'   && dest == 'inHg') fields.data[i][1] = parseFloat((fields.data[i][1] * 0.02953).toFixed(2));
       else if (source == 'mb'   && dest == 'hPa')  fields.data[i][1] = parseFloat((fields.data[i][1]).toFixed(2));
   }
   return fields;
}

//function to convert rain 
function convert_rain(source, dest, fields){
   dest = dest.trim();
   source = source.trim();
   if (source == dest) return fields;
   var i;
   for (i = 0; i < fields.data.length; i++) { 
       if (source == 'in') fields.data[i][1] = parseFloat((fields.data[i][1] * 25.4).toFixed(2));
       else if (source == 'mm') fields.data[i][1] = parseFloat((fields.data[i][1] * 0.0393701).toFixed(2));
   }
   return fields;
}
