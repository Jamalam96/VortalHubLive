$(".passwordInput").on("input", function(){
  let thisLength = $(this).val()
  let noChar = thisLength.length
  if(noChar => 1){
    $(this).next().focus()
  }
})


$(".submitButton").on("click", function(){
  $(".loginStatus").remove()
  let inputtedCode = $(".input1").val() + $(".input2").val() + $(".input3").val() + $(".input4").val()
  let objectId =  $(".loginForm").attr("data-headerid")
  $.get("/articles", function(data){
    $.each(data, function(){
      if(this._id == objectId){
        let entryCode = this.EntryCode
        if(Number(entryCode) == Number(inputtedCode)){
          $(".loginBox").after("<div class='loginStatus correctCode'>Correct Code. Redirecting..<div>")
          setTimeout(function(){
            $("#objectIdForm").submit()
          }, 1000)
        } else {
          console.log(false);
          $(".input1").val("")
          $(".input2").val("")
          $(".input3").val("")
          $(".input4").val("")
          $(".loginBox").after("<div class='loginStatus incorrectCode'>Incorrect Code. Please ask the trainer for code again<div>")
        }
      }
    })
  })
})



$(".addImageArea").on("click", function(){
  $(".imageInput").click()
})


$(".submitRegister").on("click", function(){
  $.ajaxSetup({
    async: false
  });
  event.preventDefault();
  var vortexRef = ""
  var courseDetails = []
  $.get("/articles", function(data){
    $.each(data, function(){
      let iD = this._id
      if(iD == $(".loginFormTwo").attr("data-headerid")){
        vortexRef = this.VortexRef
      }
    })
  })
  let randomDigit = Math.floor(Math.random() * 10) + 1
  let firstName = $("#firstName").val()
  let surName = $("#surName").val()
  let userId = firstName.charAt(0).toUpperCase() + surName.charAt(0).toUpperCase() + randomDigit + vortexRef.replaceAll("-","")

 var data = new FormData($('#delegateRegister')[0]);
 data.append('userId',userId )
 data.append('selectedId', $(".loginFormTwo").attr("data-headerid"))
 data.append('specificId',$(".loginFormTwo").attr("data-objid"))

   $.ajax({
              url:'/registerSubmission',
              type: 'POST',
              contentType: false,
              processData: false,
              cache: false,
              data: data,
              beforeSend: function(){$(".submitRegister").after("Uploading..Please do not navigate away from page")},
              error: function(){
                  alert('Error: Document could not be uploaded, please try again');
              },
              complete: function(data) {  $(".loginFormSection").slideUp()
                $(".successScreen").slideDown()}
          })
})


$("#photoUpload").on("change", function(){

  let userImage = ""
  let newImage = this.files[0]
  userImage = URL.createObjectURL(newImage)
  $(".imageBox").remove()
  $(".imageSection").children().remove()
  $(".imageSection").append('<img src='+userImage+' alt="" class="delegatePhoto">')
  $(".formSection").css("border-right", "solid")
  $(".formSection").css("border-right-width", "2px")
  console.log(this.files.length);
  if(this.files.length >= 1){
    $(".photoWarning").remove()
  } else {
    $(".addImage").after('<p class="photoWarning"> **Please select or take a photo of yourself</p>')
  }
})

$(".newDel").on("click", function(){
  $(".optionsFlex").slideUp()
  $(".loginFormSection").slideDown()
})

$(".returningDel").on("click", function(){
  $(".optionsFlex").slideUp()
  $(".returningInfo").slideDown()
})

$(".searchItem").on("click", function(){
  $.ajaxSetup({
    async: false
  });

  $(".returningDetails").children().remove()
  $(".returningImage").children().remove()
  $(".returnCourses").children().remove()
  $(".errorCode").remove()
  let selectedId = $(".loginFormTwo").attr("data-headerid")
  let returningSur = $("#returningSurname").val()
  let returningDOB = $("#returningDOB").val()
let arr=[]
var found = ""
var notFound = ""
  $.get("/articles", function(data){
    $.each(data, function(){
      if(this._id == selectedId){
        $.each(this.Bookings, function(){
          $.each(this.CourseInfo, function(){
            if($.inArray(this.Course, arr) == -1){
              arr.push(this.Course);
            }
          })
        })
        $.each(this.Delegates, function(){
          let surname = this.Surname
          let dob = new Date(this.DateOfBirth).toLocaleDateString("EN-GB")
          if(this.Surname = returningSur && this.DateOfBirth == returningDOB){
            found = true
            $(".returningDetails").attr("data-userid", this.UserId)
            $(".returningDetails").append('<li>First Name: '+this.FirstName+'</li><li>Surname: '+surname+'</li><li>Date of Birth: '+dob+'</li><li>Email Address: '+this.EmailAddress+'</li><li> Phone Number: '+ this.MobileNumber +'</li>')
            $(".returningImage").append('<img src="'+this.ImageLocation+'" alt="candidateImg" class="candidateImg">')
            $(".returningDetails").slideDown()
            $(".candidateImg").slideDown()
            $(".detailsClassification").slideDown()
            $(".returnSubmit").slideDown()
            $.each(arr, function(i){
              let arrayReplace = arr[i].replaceAll(" ", "_")
              $(".returnCourses").append("<p>Please select the course(s) you are attending <strong> today </strong></p><div><input type='checkbox' class='returnCoursesAttending' name="+arrayReplace+" value="+arrayReplace+"><div>"+arr[i]+"</div></div>")
            })
          } else { notFound = false}
        })
      }
    })
  })
  if(found != true){
    if(notFound == false){
      $(".returningHeader").append('<div class="errorCode">Delegate not found. Please try again</div>')

    }
  }
})

$(".returnSubmitButton").on("click", function(){
  $.ajaxSetup({
    async: false
  });

  let arr = []
  $(".returnCoursesAttending").each(function(){
    if($(this).prop("checked") == true){
        let courseVal = $(this).val().replaceAll("_", " ")
        let todayDate = new Date($.now()).toLocaleDateString("en-GB")

        arr.push({
          Course: courseVal,
          StartDate: todayDate,
          PassOrFail: "",
          Trainer: ""
        })
    }
  })
$.post("/returningDelegate", {
  returnDelCourses: arr,
  returnDelUserId: $(".returningDetails").attr("data-userid"),
  returnCourseId: $(".loginFormTwo").attr("data-headerid")
}).done(function(){
  $(".returningInfo").slideUp()
  $(".successScreen").slideDown()
})
})
