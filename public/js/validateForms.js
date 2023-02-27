(function () {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    let forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener(
        "submit",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          else{
            let $fileUpload = $("input[type='file']");
            let deleted = document.querySelectorAll('input[type=checkbox]:checked').length;
            let remain = 4;// max file number a campground can have
            try {
              if(campLength){// Added this if statement to limit multiple file selector                
                remain -= campLength;// subtract already existing camp number from remaining
                remain += deleted;// add number of already existing but deleted camp number

                if (parseInt($fileUpload.get(0).files.length)>remain){
              
                  alert(`You can only upload a maximum of ${remain} files`);
                  event.preventDefault();
                  event.stopPropagation();
                 }
                 else{
                   form.classList.add("was-validated");
                 }
              }
            } catch (error) {
              
              if (parseInt($fileUpload.get(0).files.length)>remain){

               alert(`You can only upload a maximum of ${remain} files`);
               event.preventDefault();
               event.stopPropagation();
              }
              else{
                form.classList.add("was-validated");
              }
          }
          }


        },
        false
      );
    });
  })();
