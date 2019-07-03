<!DOCTYPE html> 
<html> 
    <head> 
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css">
        <script>
        window.onload = function() {
            var vars = {};
            window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key.replace(/%27/g,"")] = value.replace(/%27/g,"");});
            document.title = vars['chart'] + " chart";
            $('#temp_unit').val(vars['temp']);
            $('#pressure_unit').val(vars['pressure']);
            $('#wind_unit').val(vars['wind']);
            $('#rain_unit').val(vars['rain']);
            $('#epoch').datepicker({
               dateFormat : 'mm-dd-yy',
               onSelect : function(dateText, inst){$('#epoch').val($.datepicker.formatDate('@', $(this).datepicker('getDate')) / 1000);}});}
         </script>
    </head> 
    <body> 
        <form action="get-method.php" method="post" name="pwd" > 
            <input type="hidden"  id="temp_unit" name = "temp_unit">
            <input type="hidden"  id="pressure_unit" name = "pressure_unit">
            <input type="hidden"  id="wind_unit" name = "wind_unit">
            <input type="hidden"  id="rain_unit" name = "rain_unit">
            <p>Epoch time to display chart for <input type="text" id="epoch" name ="epoch"></p>
            Plot Type:
            <select name="plot_type">
                <option value="tempdayplot">Temperature</option>
                <option value="bardayplot">Barometer</option>
                <option value="winddayplot">Wind</option>
                <option value="solardayplot">Solar</option>
                <option value="raindayplot">Rain</option>
            </select>
            <input type = "submit" name = "Submit" value = "Submit"> 
        </form> 
    </body> 
</html>
