// need a menu for the campuses
// then a manu for the for the type of 
 
sensors=new Array("O3_conc", "O3_cor", "O3_flowA", "O3_flowB", "O3_press", "O3_stat", "O3_temp");


Template.printplots.events({
    
      $('#siteselect').change(function(){
        populateSelect();
    });
});


function populateSelect(){
//    siteselect=$('#siteselect').val();
    $('#item').html('');
    
       eval(sensors).forEach(function(t) { 
            $('#item').append('<option>'+t+'</option>');
        });
    }
    

    
 