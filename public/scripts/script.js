// Current Date Variable
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var todayDate = new Date();
var counter

const dateFormat = {
  day: "numeric",
  month: "numeric",
  year: "numeric"
}
var currentDate = todayDate.toLocaleDateString("en-uk", dateFormat);
var currentMonth = month[todayDate.getMonth()]
var noMonth = todayDate.getMonth() + 1

var currentYear = todayDate.getFullYear()

// Set first location on Diary

$(".currentMonth").html(currentMonth + " " + todayDate.getFullYear())

var firstDate = new Date(todayDate.getFullYear(), todayDate.getMonth());
var landedFirst = firstDate.getDay() + 1;

var daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0).getDate();

// Calculations
$(document).on("change", "#end_date", function() {
  if ($(".timeScale").val() == "FullDay") {
    let endDateCalc = new Date($(this).val()).getTime()
    let startDateCalc = new Date($(this).parent().parent().children().children("#start_date").val()).getTime()
    let calcTotal1 = endDateCalc - startDateCalc
    let calcTotal2 = calcTotal1 / (1000 * 3600 * 24) + 1;
    $(this).parent().parent().children().children("#total").val(calcTotal2)
  } else {
    $(this).parent().parent().children().children("#total").val(0.5)
  }
  $(".totalDaysNew").trigger("change")
})

// End
//back to current month/today
function today() {
  todayDate = new Date();
  addOneMonth(+0)
};
// END

// Next Month
function addOneMonth(date) {
  $(".item").remove()

    var currentMonth = new Date(todayDate.setMonth(todayDate.getMonth()+date))
    var startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getTimezoneOffset()
    $(".currentMonth").html(currentMonth.toLocaleString('default', { month: 'long' }) + " " + currentMonth.getFullYear())
    let totalDays
    let daysAfter
    let daysBefore
    if(new Date(currentMonth).getTimezoneOffset() === -60){
       totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
       daysAfter = 6 - Number(new Date(currentMonth.getFullYear(), currentMonth.getMonth() +1, 0).getDay()+1)
       daysBefore = -Math.abs(Number(new Date(currentMonth.getFullYear(), currentMonth.getMonth(),0).getDay())+1)
    } else {
       totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
       daysAfter = 6 - Number(new Date(currentMonth.getFullYear(), currentMonth.getMonth() +1, 0).getDay()+1)
       daysBefore = -Math.abs(Number(new Date(currentMonth.getFullYear(), currentMonth.getMonth(),0).getDay())+1)
    }
    for(daysBefore; daysBefore <= Number(totalDays + daysAfter ); daysBefore++){
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      let i = daysBefore
      let currentDay = new Date(startDate.setDate(startDate.getDate() + i))
      let currentMonthString = new Date(startDate).getMonth() +1
      let currentClass
      if(daysBefore < 0 || daysBefore >= totalDays){
        currentClass = "monthBefore"
      }
          $(".grid").append("<li class='item' id ='" + new Date(currentDay).getFullYear() + ("0" + currentMonthString).replace(/^0+/, '') +  new Date(currentDay).getDate() + "' data-datespan=" + new Date(currentDay).getFullYear() + "-" + ("0" + currentMonthString).slice(-2) + "-" + ("0" + new Date(currentDay).getDate()).slice(-2) + "><div class='dayBorder "+currentClass+"' ></div><span class=dateNo>" + new Date(currentDay).getDate() + "</span></li>");


          if(daysBefore ==  Number(totalDays + daysAfter )){
            if($(".bodyMain").css('display') == "block"){
              itemMovement()
            } else {
              setTimeout(function(){
                itemMovement()
              },10)
            }
          }
    }
    $("#"+new Date().toISOString().substring(0,10).replaceAll("-0","").replaceAll("-","")).find(".dayBorder").addClass("todaySelected")

};

// fetch through //

function fetchReq(selectedId){
  var timeout = ""
  var timeoutTwo = ""
  $("#stageInvNo").val("").attr('data-originalno',"")
  $("#stageInvDate").val("").removeAttr('data-originaldate',"")
  $("#stagePaidDate").val("").removeAttr('data-originaldate')
  $("#matrixPaidCheck").show()
  $(".testingType").show()
  $("#matrixBatchNumber").val('')
  $("#matrixTrackingNumber").val('')
  $("#matrixPaidCheck").prop("checked",false)
  $(".bookingItemOuter").remove()
  $(".trainerDetails").not(':first').remove()
  $.post("/matrixRetrieve", {
    idOne:selectedId
  }).done(function(foundBooking){
    $(".vortexRefMatrix").text(foundBooking.VortexRef)
    $(".vortexBookedBy").text('Booking created by: ' + foundBooking.CreatedBy)
    $("#orgNameMatrix").val(foundBooking.Organisation)
    $("#orgNameMatrix").trigger("change")
    $("#bookerNameMatrix").val(foundBooking.BookerName)
    $("#bookerEmailMatrix").val(foundBooking.BookerEmail)
    $(".archiveLocation").text(foundBooking.ArchiveBoxNumber)
    $("#archiveInput").val(foundBooking.ArchiveBoxNumber)
    $(".archiveNumber").remove()
    if(foundBooking.ArchiveBoxNumber == "" || foundBooking.ArchiveBoxNumber == undefined || foundBooking.ArchiveBoxNumber == null){
      $(".archiveNumber").remove()
    } else {
      $(".archiveBoxArea").append('<span class="archiveNumber">'+foundBooking.ArchiveBoxNumber+'</span>')
    }
    for(b = 0; b <= foundBooking.Bookings.length -1; b++){
                let specificBooking = foundBooking.Bookings[b]
                $(".bookingItemsBar").append('<div class="bookingItemOuter"><div class="itemBooking" data-specificId="'+specificBooking._id+'"> Booking - '+Number(b + 1)+' </div></div>')
                let courseArr = []
                let totaldays = ""
                let dayRate = ""
                let cardType = specificBooking.CardsIncluded
                let delArr= []
                let delTotal = 0
                let $clone = $(".trainerDetails").eq(0).clone()


                if(specificBooking.Delegates != undefined){
                  delTotal = specificBooking.Delegates.length
                  for(d =0 ; d<= specificBooking.Delegates.length -1; d++){
                    delArr.push('<li>'+this.FirstName+ "  "+ this.Surname +'</li>')
                  }
                }
                if(specificBooking.TrainerArray != undefined){
                  for(tr =0 ; tr <= specificBooking.TrainerArray.length-2; tr++){
                    $(".trainerDetails").eq(tr).clone().insertAfter(".trainerDetails:first")
                  }
                }


                for(c = 0; c <= specificBooking.CourseInfo.length -1; c++){
                    let courseInfo = specificBooking.CourseInfo[c]
                    totaldays = courseInfo.TotalDays
                    dayRate = courseInfo.Rate
                    if(this.TestingType == "NPORS Testing Type"){
                      courseArr.push('<li>'+this.Course+'<li>')
                    } else {
                      courseArr.push('<li>'+this.Course+' - '+this.TestingType+'</li>')
                    }
                }
                $(".matrixBody").slideDown(600)
                $(".matrixBody").attr("data-headerid", selectedId)


    }
    $(".itemBooking").eq(0).trigger('click')

  })
}

$(document).on("dblclick",".diaryItems", function(){
  $(".vortalWindow").slideUp(400)
  let item = this
  setTimeout(function(){
    fetchReq($(item).attr('data-headerid'))
  },400)

  $(".detailsHere").children().remove()
  hoverLock = "unlocked"
  $(".lockSymbol").removeClass("fa-lock").addClass("fa-lock-open")
})

$(document).on("click", " .specificMissing, .saveCourse, .foundItem, .goToBooking", function fetchTest() {
  const width = $(".bodyMain").width()
  const height = $(".bodyMain").height()
  let selectedId = ''
  let item = this
  setTimeout(function(){
    switch (true) {
        case $(item).hasClass("goToBooking"):fetchReq($(item).closest(".candidateItem").attr('data-headerid'))

          break;
      default:
        fetchReq($(item).attr('data-headerid'))
    }
  },400)


  matrixReset()
  $(".vortalWindow").slideUp(400)
  $(".matrixDocs").removeClass("active")
  $(".matrixDocs").eq(0).addClass("active")
  $(".addNewDoc").attr("data-docupload", "Register")
  $(".pdfViewer").hide()
  $(".searchBox").animate({left: -640}, 400)
  $(".searchBox").hide(450)
  $(".searchTextBox").val("")
  $(".searchTextBox").attr("type","text")
  //////DelegateOverlay///////
  $(".OverlayTwo").animate({'left': '-100%'})
  $('.OverlayTwo').removeClass("Open")
  $(".delegateImgTwo").css({'background-image': "url('/Images/vortalPortraitStandIn.png')"})
  $("#delegatePhotoChange")[0].reset()
  $(".delegateForm").trigger('reset')
  $(".delegateDetailsEdit").removeAttr("data-userid")
  /////ViewerOverlay////////
  $(".OverlayThree").animate({'right': '-45%'})
  $(".matrixViewer").attr("data", '').addClass("hidden")
  //////CandidateOverlay////////
  $(".overLayCandidate").animate({'right': '-70%'})
  $('.overLayCandidate').removeClass("Open")
  //////OrgOverlay//////
  $(".orgOverlay").animate({'right': '-70%'})
  $('.orgOverlay').removeClass("Open")
  //////CourseOverlay//////
  $(".courseOverlay").animate({'right': '-30%'})
  $('.courseOverlay').removeClass("Open")

  $(".vortalNavItem").each(function(){
    $(this).removeClass("active")
    if($(this).attr("data-navitem") == "Diary"){
      $(this).addClass("active")
    }
  })
})

$(document).on("click",".clearNote", function(){
  $('#note').val('')
  $("#noteSeverity").val('Standard')
})

$(".sendNote").on("click", function(i) {

  let currentUser = $(".currentLoggedOn").attr('data-userfn')
  let newNote = $("#note").val()
  let currentJob = $(".matrixBody").attr("data-headerid")
  let severity = $("#noteSeverity").val()
  $.post("/newNote",

    {
      postReqCurrent: currentJob,
      postReqNote: newNote,
      postReqUser: currentUser,
      postReqSeverity: severity,
      postReqTimeStamp: new Date($.now()).toLocaleDateString("en-GB")
    },
    function(data, status) {
    }).done(function(){
      notesUpdates($(".matrixBody").attr('data-headerid'))
    })
})

  // GET END

//Function END//

$(document).on("click", ".closeMatrix", function() {
if($(".matrixScroll").find(".Updated").length > 0 || $(".matrixScroll").find(".New").length > 0 ){
  let confirmation = confirm("You are trying to leave this page with unsaved items. If you close this page now it will not save. Do you want to continue?")
  if(confirmation == true){
    $(".matrixBody").slideUp(400)
    $(".bodyMain").delay(400).slideDown(400)
    addOneMonth(+0)
  }
} else {
  $(".matrixBody").slideUp(400)
  $(".bodyMain").delay(400).slideDown(400)
  addOneMonth(+0)
}
})

function resetFilter(){
  $(".trainerfilteredList").children().remove()
  $(".orgfilteredList").children().remove()
  itemMovement()
  $(".diabledTrainerFilterItem").removeClass("diabledTrainerFilterItem").addClass('trainerFilterItem')
  $(".diabledOrgFilterItem").addClass('orgFilterItem').removeClass("diabledOrgFilterItem")
  $(".orgFilterItem").slideDown(300).removeClass("hidden")
  $(".trainerFilterItem").slideDown(300).removeClass("hidden")

}


// New movement with fetch //
function itemMovement() {
  $(".spare").remove()
  $(".diaryItems").fadeOut().remove()
  $(".hiddenItems").fadeOut().remove()
  $(".testBox").children().remove()
  var selectedItem = $(".floatingBox").attr("data-idobject")
  let filter = []
  let filteredItem = ""
  if($(".trainerfilteredList").children().length > 0){
    $(".trainerfilteredList").children().each(function(){
      filter.push($(this).text())
    })

  } else {
    $(".orgfilteredList").children().each(function(){
      filter.push($(this).text())
    })
  }
  let filterSearch = []
  let elSearch = []
  for(o = 0; o <= $(".item").length-1; o++){
    filterSearch.push({'Bookings.Start':$(".item").eq(o).attr('data-datespan')})
    elSearch.push($('.item').eq(o).attr('id'))
  }
  $.post("/diaryRetrieve",{
    totalDays:filterSearch,
  }).done(function(data){
    let eachBooking = []
    for(i = 0; i <= data.length-1 ; i++){
      for(b = 0; b <= data[i].Bookings.length -1; b++){
                if($(".trainerfilteredList").children().length > 0){
                  if(data[i].Bookings[b].TrainerArray != undefined){
                      let trainerArray = []
                      for(tr = 0; tr <= data[i].Bookings[b].TrainerArray.length -1; tr++ ){
                        trainerArray.push(data[i].Bookings[b].TrainerArray[tr].Trainer)
                      }
                    filteredItem = filter.some(element => {
                          return trainerArray.includes(element);
                      });
                  } else {
                    filteredItem = filter.includes(data[i].Bookings[b].Trainer)
                  }
                } else {
                  filteredItem = filter.includes(data[i].Organisation)
                }
                if(filteredItem || filter.length == 0){
        let booking = data[i].Bookings[b]
        Object.assign(booking, {headerId: data[i]._id})
        Object.assign(booking, {vortexRef: data[i].VortexRef})
        Object.assign(booking, {Status: data[i].Status})
        eachBooking.push(booking)
      }
      }
    }
      for(el = 0; el <= elSearch.length-1; el++){
        let result = eachBooking.filter(c => c.el === elSearch[el])
        result.sort(function(a,b){
          const lengthA = Number(a.TotalDays)
          const lengthB = Number(b.TotalDays)
          if (lengthA > lengthB) {
                return -1;
              }
              if (lengthA < lengthB) {
            return 1;
            }
          return 0
        })
        for(r = 0; r <= result.length -1; r++){
          let totalDays = result[r].TotalDays
          let startDate = new Date(result[r].Start)
          let startIso = startDate.toISOString().substring(0,10)
          let startIsoTag = startIso.toString().replaceAll("-0","").replaceAll("-","")
          let afterWeekend = Number(totalDays) - (7 - Number(new Date(result[r].Start).getDay()))
          let beforeWeekend = 0
          let nporsNote = ""
                  if(result[r].NPORSNotification == undefined || result[r].NPORSNotification == null || result[r].NPORSNotification == "" || result[r].NPORSNotification == "Select One"){
                    nporsNote = ""
                  } else {
                    if(result[r].NPORSNotification == "Internal"){
                      nporsNote = '<i class="fa-solid fa-circle-check internalNotification"></i>'
                    } else {
                      nporsNote = '<i class="fa-solid fa-circle-check externalNotification"></i>'
                    }
                  }
                  let trainerBefore = result[r].Trainer
              let dataTrainer = ""
              if(trainerBefore == "" ||trainerBefore == undefined || trainerBefore == null || trainerBefore == "  "){
                  dataTrainer = "" }
                  else {
                if(trainerBefore == "Tyler Noblett" || trainerBefore == "Paul Weisner"){
                  if(trainerBefore == "Tyler Noblett"){
                    dataTrainer = "TYN"
                  } else {
                    dataTrainer = "PAWE"
                  }
                } else {
                  if(trainerBefore.indexOf(" ") == -1){
                    dataTrainer = trainerBefore
                  } else {
                    dataTrainer = trainerBefore.split(" ")[0].toString().substring(0,1).toUpperCase()  + trainerBefore.split(" ")[1].toString().substring(0,1)
                  }
                }
              }
          let diaryString = dataTrainer+"-"+result[r].vortexRef + nporsNote

          let stage = result[r].TrainerStage[result[r].TrainerStage.length - 1].Stage
                     let overallStage = result[r].Status
                  let stagedec = ""
                  if( stage == "Cancelled"){
                    stagedec = stage
                  } else {
                    if(result[r].AwardingBody == "NVQ"){
                      stagedec = "NVQ"
                    } else {
                      stagedec = overallStage
                    }
                  }
                  let invStage = ""
                  let invStageFirst = ""
                  if(result[r].Invoice != undefined || result[r].Invoice != null){
                    if (result[r].Invoice[result[r].Invoice.length - 1].Stage == "Invoiced"){
                      invStage = stagedec.substring(0,3) + "Invoiced"
                      invStageFirst = stagedec.substring(0,3) + "Invoicedfirst"
                    }
                  }
                  let paidStage = ""
                  let paidStageFirst = ""
                  if(result[r].Paid != undefined ||result[r].Paid != null )
                  switch (result[r].Paid[result[r].Paid.length - 1].Stage) {
                    case "Paid":paidStage = "PaidBooking"
                    paidStageFirst = "PaidBooking"

                      break;
                    case "N/A":
                    paidStage = "CancPaidBooking"
                    paidStageFirst = "CancPaidBookingFirst"
                      break;
                  }

                  let trainerFirst =""

                  if(result[r].TrainerArray != undefined){
                    for(trainers = 0; trainers <= result[r].TrainerArray.length -1; trainers++){
                      if(new Date(startIso) >= new Date(result[r].TrainerArray[trainers].Start) && new Date(startIso) <= new Date(result[r].TrainerArray[trainers].End) ){
                        if(startIso == result[r].TrainerArray[trainers].Start){
                          if(result[r].TrainerArray[trainers].Trainer == ""){
                            diaryString = "-"+result[r].vortexRef + nporsNote
                          } else {
                            let trainerName = ""
                            if(result[r].TrainerArray[trainers].Trainer == "Tyler Noblett" || result[r].TrainerArray[trainers].Trainer == "Paul Weisner"){
                              if(result[r].TrainerArray[trainers].Trainer == "Tyler Noblett"){
                                trainerName = "TYN"
                              } else {
                                trainerName = "PWE"
                              }
                            } else {
                              if(result[r].TrainerArray[trainers].Trainer.indexOf(" ") == -1){
                                trainerName = result[r].TrainerArray[trainers].Trainer
                              } else {
                                trainerName = result[r].TrainerArray[trainers].Trainer.split(" ")[0].toString().substring(0,1).toUpperCase() + result[r].TrainerArray[trainers].Trainer.split(" ")[1].toString().substring(0,1).toUpperCase()
                              }
                            }
                            diaryString = trainerName+"-"+result[r].vortexRef + nporsNote
                          }
                        } else {
                          diaryString = "&nbsp;"
                        }
                      }
                    }
                  } else {
                    if(startIso == result[r].Start || new Date(startIso).getDay() == 0){
                      diaryString =  dataTrainer+"-"+result[r].vortexRef + nporsNote
                    } else {
                      diaryString = "&nbsp;"
                    }
                  }

          if(Number(new Date(result[r].Start).getDay()) + Number(totalDays) > 7){
            beforeWeekend = 7 - Number(new Date(result[r].Start).getDay())
          } else {
            beforeWeekend = Number(totalDays)
          }
          if(totalDays == 1){
            if($("#"+startIsoTag).find(".blankCell").length > 0){
              $("#"+startIsoTag).find(".blankCell:first").before('<li class="firstItem diaryItems width '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')
              $("#"+startIsoTag).find(".blankCell:first").remove()
              } else {
              $("#"+startIsoTag).append('<li class="firstItem diaryItems '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')
            }
          } else {
            if(totalDays == 0.5 || totalDays == '0.5' ){
              switch (result[r].TimeScale) {
                case "AM":$("#"+startIsoTag).append('<li class="firstItem diaryItems widthAM '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')


                  break;
                case "PM":$("#"+startIsoTag).append('<li class="firstItem diaryItems widthPM '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')

                  break;
                  default:$("#"+startIsoTag).append('<li class="firstItem diaryItems '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')


              }
            } else {
              $("#"+startIso.toString().replaceAll("-0","").replaceAll("-","")).append('<li class="firstItem diaryItems widthx'+beforeWeekend+" "+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>').index()
                let headerindex = $("#"+startIso.toString().replaceAll("-0","").replaceAll("-","")).find('[data-headerid="'+result[r].headerId+'"]').index()
                let trainerSet = dataTrainer
              for(total = 1; total <= totalDays-1; total++){
                let next = new Date(startDate.setDate(startDate.getDate() + 1)).toISOString().substring(0,10)
                if(result[r].TrainerArray != undefined){
                  for(trainers = 0; trainers <= result[r].TrainerArray.length -1; trainers++){
                    if(new Date(next) >= new Date(result[r].TrainerArray[trainers].Start) && new Date(next) <= new Date(result[r].TrainerArray[trainers].End) ){
                      if(next == result[r].TrainerArray[trainers].Start){
                        if(result[r].TrainerArray[trainers].Trainer == ""){
                          diaryString = "&nbsp;"+result[r].vortexRef + nporsNote

                        } else {
                          if(result[r].TrainerArray[trainers].Trainer == "Tyler Noblett"){
                            diaryString = "TYN-"+result[r].vortexRef + nporsNote
                          } else {
                            diaryString = result[r].TrainerArray[trainers].Trainer.split(" ")[0].toString().substring(0,1).toUpperCase() + result[r].TrainerArray[trainers].Trainer.split(" ")[1].toString().substring(0,1).toUpperCase()+"-"+result[r].vortexRef + nporsNote
                          }

                        }
                      } else {
                        diaryString = "&nbsp;"
                      }
                    }
                  }
                } else {
                  if(next == result[r].Start || new Date(next).getDay() == 0){
                    diaryString =  dataTrainer+"-"+result[r].vortexRef + nporsNote
                  } else {
                    diaryString = "&nbsp;"
                  }
                }
                if( new Date(next).getDay() == 0){
                  let difference = Number(totalDays) - Number(total)
                  if(difference > 7){
                    $("#"+next.toString().replaceAll("-0","").replaceAll("-","")).append('<li class="firstItem diaryItems widthx7 '+stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>').index()
                  } else {
                    $("#"+next.toString().replaceAll("-0","").replaceAll("-","")).append('<li class="firstItem diaryItems widthx'+difference+" " + stagedec+" "+invStageFirst+" "+paidStageFirst+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>').index()
                  }
                } else {
                  $("#"+next.toString().replaceAll("-0","").replaceAll("-","")).append('<li class="diaryItems '+stagedec+" "+invStage+" "+paidStage+'" data-headerid="'+result[r].headerId+'" data-objid="'+result[r]._id+'">'+diaryString+'</li>')
                }
                let thisIndex = $("#"+next.toString().replaceAll("-0","").replaceAll("-","")).find('[data-headerid="'+result[r].headerId+'"]').index()
  /////Add in the blanks/////
                if (thisIndex < headerindex){
                  for(diff = 1; diff <= headerindex - thisIndex; diff++){
                    $("#"+next.toString().replaceAll("-0","").replaceAll("-","")).find('[data-headerid="'+result[r].headerId+'"]').before("<li class='spare blankCell' style='background-color: rgba(255, 255, 255, 0); '>" + "&nbsp;"+ "</li>")
                  }
                }
  /////////////////////////
              }
            }

          }
        }
      }
  }).done(function(){
    setTimeout(function(){
      overFlow()
    },100)
  })
  }
function newFormSubmission() {
  var certsstatus =[]
  var cardsstatus =[]
  var paperworkstatus = []

  $(".newFormLoading").show()
  const getRanHex = size => {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for (let n = 0; n < size; n++) {
      result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
  }

  var bookingsArray = []

if($("#trainerOnly").val() == "true"){
  paperworkstatus = {"Stage": "N/A"}
} else {
  paperworkstatus = {"Stage": "Pending"}
}
  $(".bRow").each(function() {
    let awardingBody = $(this).find("#awardingBody").val()
    $.get("/courses",function(data){
      for(i = 0; i <= data.length-1; i++){
        let item = data[i]
        if(item.AwardingBody.includes(awardingBody)){

          if(item.Certs == "No"){
            certsstatus = {"Stage": "N/A"}
          } else {
            certsstatus = {"Stage": "Pending"}
          }
          if(item.Cards == "No"){
            cardsstatus = {"Stage": "N/A"}
          } else {
            cardsstatus = {"Stage": "Pending"}
          }
        }
      }
    })

    var trainerArray = []

    for(tr = 0; tr <= $(".bookingTrainerArray").length -1; tr++){
      trainerArray.push({
        Trainer: $(".bookingTrainerArray").eq(tr).find(".newTrainerSelect").val(),
        Start: $(".bookingTrainerArray").eq(tr).find(".bookingtrainerStart").val(),
        End: $(".bookingTrainerArray").eq(tr).find(".bookingtrainerEnd").val()
      })
    }

    var coursesArray = []
    $(this).find(".rowCT").each(function() {
      coursesArray.push({
        Course: $(this).find("#coursePickerInput").val(),
        BookedDelegates: $(this).find("#bookedDelegates").val(),
        TestingType: $(this).find("#levelPicker").val()
      })
    })

    bookingsArray.push({
      _id: getRanHex(24),
      el: $(this).find("#el").val(),
      TrainerArray: trainerArray,
      Start: $(this).find("#start_date").val(),
      TimeScale: $(this).find("#timeScale").val(),
      End: $(this).find("#end_date").val(),
      TotalDays: $(this).find("#total").val(),
      SiteLocation: $(this).find("#siteLocation").val(),
      SiteContact: $(this).find("#siteContact").val(),
      SiteContactNumber: $(this).find("#siteContactNumber").val(),
      CandidateDayRate: $(this).find("#DayOrCandidate").val(),
      Rate: $(this).find("#rate").val(),
      CardsIncluded: $(this).find("#cardReq").val(),
      CardRate: $(this).find("#cardRate").val(),
      CourseInfo: coursesArray,
      Total: $(this).find("#totalBooking").val(),
      PONumber: $(this).find("#poNumber").val(),
      AwardingBody: $(this).find("#awardingBody").val(),
      TrainerStage: [{
        Stage: "New"
      }],
      Paperwork:[JSON.parse(JSON.stringify(paperworkstatus))],
      Register:[{'Stage':'Pending'}],
      Cards:[JSON.parse(JSON.stringify(cardsstatus))],
      Certs:[JSON.parse(JSON.stringify(certsstatus))],
      Invoice:[{'Stage':'Pending'}],
      Paid:[{'Stage':'Pending'}]
    })
  })
  if (window.navigator.onLine == true) {
    $.post("/request",

      {
        postReqTitle: $("#title").val(),
        postReqTraOn: $("#trainerOnly").val(),
        postReqOrg: $("#newOrgSelectInput").val(),
        postReqBooker: $("#newBookerSelect").val(),
        postReqBookEmail: $("#bookerEmail").val(),
        postReqBookings: bookingsArray,
        postReqOverall: $("#overallTotal").val(),
        postStatus: 'Confirmed',
        postCreatedBy: $(".currentLoggedOn").attr('data-userfn')
      },
      function(data, status) {
        delegateUpdate("CourseAdded",data)
      }).done(setTimeout( function(){hideNewItem()
      },300));
  }


}

function newItemShow() {
  $(".newBookingFormTwo").animate({right: 0})
}

function hideNewItem() {
  if($(".unfinishedInfo").css('width') != '0px'){
      missingList()
  }
  $(".newBookingTrainingForm").find("input").val("")
  $(".newBookingTrainingForm").find("select").val($("select option:first").val())
  $(".rowCT").not(":first").remove()
  $(".bRow").not(":first").remove()
$(".newFormLoading").hide()
}



document.onload = addFormData()

function addFormData() {
  var orgarray = []
  $.get("/courses", function(data) {
    $.each(data, function(i) {
      let awardingBody = data[i].AwardingBody
      $(".awardingBody").append('<option value="' + awardingBody + '">' + awardingBody + '</option>')
      $("#matrixAwardingBody").append('<option value="' + awardingBody + '">' + awardingBody + '</option>')
    })
  })

  $.get("/trainerMatrix", function(data){
    data.sort(function(a,b){
      if(a.FullName.toUpperCase() < b.FullName.toUpperCase()) { return -1; }
      if(a.FullName.toUpperCase() > b.FullName.toUpperCase()) { return 1; }
      return 0;
    })
    for(i=0; i<= data.length-1; i++){
      trainer = data[i].FullName
      $("#newtrainerSelect").append('<option value="' + trainer + '">' + trainer + '</option>')
      $("#edittrainerSelect").append('<option value="' + trainer + '">' + trainer + '</option>')
      $(".matrixTrainer").append('<option value="' + trainer + '">' + trainer + '</option>')
      $(".trainerList").append('<li class="trainerFilterItem">'+trainer+'</li>')
    }
  })

  $.get("/CompanyData", function(data) {

    data.sort(function(a,b){
      if(a.CompanyName.toUpperCase() < b.CompanyName.toUpperCase()) { return -1; }
      if(a.CompanyName.toUpperCase() > b.CompanyName.toUpperCase()) { return 1; }
      return 0;
    })
    for(i = 0; i <= data.length-1;i++){
      let individualOrg = data[i].CompanyName
      $("#newOrgSelect").append('<option value="' + individualOrg + '">' + individualOrg + '</option>')
      $(".orgList").append('<li class="orgFilterItem">'+individualOrg+'</li>')
      $("#orgNameMatrix").append('<option value="' + individualOrg + '">' + individualOrg + '</option>')
    }
  })
}

function orgSelected() {
  $("#newBookerSelect").children().remove()
  $("#newBookerSelect").append('<option value="">Select One</option>')
  $.post("/orgRetrieve",{
    Name: $("#newOrgSelectInput").val()
  }).done(function(data){
    for(i = 0; i <= data.User.length -1; i++){
      let org = data.User[i]
      $("#newBookerSelect").append('<option value="' + org.FullName + '">' + org.FullName + '</option>');

    }
  })
}

function bookerSelected() {
  $.post("/orgRetrieve",{
    Name: $("#newOrgSelectInput").val()
  }).done(function(data){
    for(i = 0; i <= data.User.length -1; i++){
      let org = data.User[i]
      if(org.FullName == $("#newBookerSelect").val()){
        $("#bookerEmail").attr("value", org.EmailAddress)
      }
    }
  })
}

function closeScreen() {
  const width = $(".bodyMain").width()
  const height = $(".bodyMain").height()

  $(".matrixBody").css("width", width).css("height", height)

  $(".matrixBody").slideUp(500)
  $(".bodyMain").delay(500).slideDown(500)

}

function addRow() {
  $(".bookingRow").clone().removeClass("bookingRow").addClass("bRow").appendTo(".courseBookings").append('<button type="button" name="button" class="btn btn-info removeRow">Remove Booking</button></span>')
}

$(document).on("click", ".removeRow", function() {
  $(this).parent().remove()
})


$(document).on("change", ".start_date", function() {
  $(".bookingtrainerStart").val($(this).val())
  $(".temporary").remove()
  let val = $(this).val().replaceAll("-0", "").replaceAll("-", "")
  $(this).parent().parent().find('#el').val(val)
  let item = $(this).val().toString().replaceAll("-0", "").replaceAll("-","")
  let nextItem = $("#"+item).find('.dateNo').next().attr('data-objid')

  if( $(".diaryItems[data-objid='"+nextItem+"']").length == 1 || nextItem == undefined){
      let secondnextItem = $("#"+item).find('.dateNo').next().next().attr('data-objid')
      $("#"+item).find('.dateNo').after('<li class="diaryItems temporary temporaryInitial hidden">New Booking</li>')

      $(".diaryItems[data-objid='"+secondnextItem+"']").not("#"+item+" .diaryItems[data-objid='"+secondnextItem+"']").before('<li class="spare blankCell temporary" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')

  } else {
    $("#"+item+" .diaryItems[data-objid='"+nextItem+"']").before('<li class="diaryItems temporary temporaryInitial hidden">New Booking</li>')
    $(".diaryItems[data-objid='"+nextItem+"']").not("#"+item+" .diaryItems[data-objid='"+nextItem+"']").before('<li class="spare blankCell temporary" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
  }
  for(st = 0; st <= $("#"+item).children(".diaryItems").length -1; st++){
    let find = $("#"+item).children(".diaryItems").eq(st).attr('data-objid')
    if($(".diaryItems[data-objid='"+find+"']").length > 1){
      let nextLast = $(".diaryItems[data-objid='"+find+"']:last").next().attr('data-objid')
      if($(".diaryItems[data-objid='"+nextLast+"']").length > 1){
        for(n = 0; n <= $(".diaryItems[data-objid='"+nextLast+"']").length -1; n++){
          if($(".diaryItems[data-objid='"+nextLast+"']").eq(n).closest(".item").find(".temporary").length == 0){
            $(".diaryItems[data-objid='"+nextLast+"']").eq(n).before('<li class="diaryItems temporary temporaryExtra" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
          }
        }
      }
    }
  }
  overFlow()
})

$(document).on("change", ".totalDaysNew", function(){
  let totalDays = $(this).val()
  $(".temporarySpare").remove()
  $(".temporaryExtra").remove()
  let startdate = new Date($("#start_date").val())
  let item = new Date(startdate).toISOString().substr(0,10).replaceAll("-0", "").replaceAll("-","")
  for(i = 1; i <= $(this).val()-1; i++){
  let newDate = new Date(startdate.setDate(startdate.getDate()+1)).toISOString().substr(0,10).replaceAll("-0","").replaceAll("-","")
     $("#"+newDate).find('.dateNo').after('<li class="diaryItems temporary temporarySpare" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
    if($("#"+newDate).children(".temporaryExtra").length > 0){
      $("#"+newDate).children(".temporaryExtra").remove()
    }
    for(ne = 0; ne <= $("#"+newDate).children(".diaryItems").length -1; ne++){
      let find = $("#"+newDate).children(".diaryItems").eq(ne).attr('data-objid')
      if($(".diaryItems[data-objid='"+find+"']").length > 1){
        let nextLast = $(".diaryItems[data-objid='"+find+"']").attr('data-objid')
        if($(".diaryItems[data-objid='"+nextLast+"']").length > 1){
          for(n = 0; n <= $(".diaryItems[data-objid='"+nextLast+"']").length -1; n++){
            if($(".diaryItems[data-objid='"+nextLast+"']").eq(n).closest(".item").find(".temporary").length == 0){
              $(".diaryItems[data-objid='"+nextLast+"']").eq(n).before('<li class="diaryItems temporary temporaryExtra" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
            }
          }
        }
      }
    }
  }

  for(te = 0; te <= $(".temporaryExtra").closest(".item").length -1; te++){
    let item = $(".temporaryExtra").closest(".item").eq(te)
    for(tei = 0; tei <= $(item).children(".diaryItems").length-1; tei++){
      let find = $(item).children(".diaryItems").eq(tei).attr('data-objid')
      for(found = 0; found<= $(".diaryItems[data-objid='"+find+"']").length-1; found++){
        if($(".diaryItems[data-objid='"+find+"']").eq(found).closest(".item").find(".temporary").length == 0){
          $(".diaryItems[data-objid='"+find+"']").eq(found).before('<li class="diaryItems temporary temporaryExtra" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
        }
      }
    }
  }
  for(st = 0; st <= $("#"+item).children(".diaryItems").length -1; st++){
    let find = $("#"+item).children(".diaryItems").eq(st).attr('data-objid')
    if($(".diaryItems[data-objid='"+find+"']").length > 1){
      let nextLast = $(".diaryItems[data-objid='"+find+"']").next().attr('data-objid')
      if($(".diaryItems[data-objid='"+nextLast+"']").length > 1){
        for(n = 0; n <= $(".diaryItems[data-objid='"+nextLast+"']").length -1; n++){
          if($(".diaryItems[data-objid='"+nextLast+"']").eq(n).closest(".item").find(".temporary").length == 0){
            $(".diaryItems[data-objid='"+nextLast+"']").eq(n).before('<li class="diaryItems temporary temporaryExtra" style="background-color: rgba(255, 255, 255, 0); ">&nbsp;</li>')
          }
        }
      }
    }
  }



for(temp = 0; temp <= $(".temporarySpare").length-1; temp++){
    let startDay =  Number(new Date($(".temporaryInitial").closest(".item").attr('data-datespan')).getDay())
    let startCalc = 7 - Number(startDay)
    let beforeWeekend = Number(startDay) + Number(totalDays-1)
    let width = 0
      if(Number(beforeWeekend) > 6){
        width = Number(startCalc)*100
      } else {
        width = Number(totalDays * 100)
      }
      $(".temporaryInitial").animate({width: width+'%'})
       if(new Date($(".temporarySpare").eq(temp).closest(".item").attr('data-datespan')).getDay() == 0){

         $(".temporarySpare").eq(temp).addClass("temporaryInitialPlus").removeAttr('style').text('New Booking Cont..')
      }
  }

})

$("#trainerOnly").click(function() {
  if ($(this).prop("checked")) {
    $(this).val(true)
  } else {
    $(this).val(false)
  };
})

$(document).on("change", "#awardingBody,  #matrixAwardingBody", function(e, data) {
  let item = this
  let currentVal = $(this).val()
  let parentVar = $(this).parent().parent().parent()
  if($(this).attr('id') != 'matrixAwardingBody'){
    $(parentVar).find(".courseOption").remove()
    $('#cardReq').children().remove()
    $('.testType').addClass('hidden')
    if($(this).val() == "NPORS"){
      $('.testType').removeClass('hidden')
    }
  } else {
      $("#matrixCardSelect").children().remove()
  }
  $.get("/courses", function(data) {
    let mainLookup = data

    $.each(mainLookup, function(i) {
      if (mainLookup[i].AwardingBody == currentVal) {
        let awardingBodyVar = mainLookup[i].Courses
        $.each(awardingBodyVar, function(t) {
          let course = awardingBodyVar[t].Course
          $(parentVar).find(".coursePicker").append('<option value="' + course + '" class="courseOption">' + course + '</option>');
        })
        $.each(this.AccreditationTypes, function(){
          if($(item).attr('id') != 'matrixAwardingBody'){
            $('#cardReq').append('<option value="'+this.Description+'">'+this.Description+'</option>')
          } else {
            $("#matrixCardSelect").append('<option value="'+this.Description+'">'+this.Description+'</option>')
          }
        })
      }
    })
  }).done(function(){
    if(data != undefined){
      if(data.Cards == undefined || data.Cards == null){
        data.Cards
      }
        else {
          if(data.Cards == ""){
            $(".OverlayOne").removeClass("modified")
          } else {
            $("#matrixCardSelect").val(data.Cards)
            $(".OverlayOne").removeClass("modified")
          }


      }
    }

  })

})

$(document).on("click", ".addcourseRowEditMode", function(){
  let clone = $(this).closest(".quickEditMode").clone()
  $(this).closest(".quickEditMode").after(clone)
  $(this).closest(".quickEditMode").next(".quickEditMode").find(".addcourseRowEditMode").text("-").removeClass("addcourseRowEditMode").addClass("removecourseRowEditMode").css("padding", "0 0.5rem")
})

$(document).on("click",".removecourseRowEditMode", function(){
  $(this).closest(".quickEditMode").remove()
})

$(document).on("click", ".addcourseRow", function() {
    let parent = $(this).closest(".bRow")
  $(parent).find(".rowOne:first").clone().insertAfter($(".rowOne:last"))
    $(parent).find(".removecourseRow").removeAttr('disabled')
})

$(document).on("click", ".removecourseRow", function() {
  let parent = $(this).closest(".bRow")
  $(parent).find(".rowOne:last").remove()
  if($(parent).find(".rowOne").length == 1){
      $(parent).find(".removecourseRow").attr('disabled',true)
  }
})




$(document).on("change", ".rateChange", function() {


  let totalDaysCalc = $(this).closest(".bRow").find("#total").val()
  let rateCalc = $(this).closest(".bRow").find("#rate").val()
  let selectedType = $(this).closest(".bRow").find("#DayOrCandidate").val()
  let cardRate = $(this).closest(".bRow").find("#cardRate").val()
  let cardSelection = $(this).closest(".bRow").find("#cardReq").val()
  let bookedTotal = 0
  let totalForBooking = $(this).closest(".bRow").find("#totalBooking")

  $(this).closest(".bRow").each(function() {
    $(this).children(".rowCT").each(function() {
      $(this).children().find(".bookedDelegates").each(function() {
        bookedTotal += Number($(this).val())
      })
    })
  })

  if (selectedType == "Day Rate") {
    let dayRateCalc = Number(totalDaysCalc * rateCalc)
    let cardRateCalc = Number(bookedTotal * cardRate)
    if (cardSelection === "No") {
      totalForBooking.val(dayRateCalc)
    } else {
      totalForBooking.val(dayRateCalc + cardRateCalc)
    }

  } else {
    let ratesCalc = Number(cardRate) + Number(rateCalc)
    let candRateCalc = Number(bookedTotal * ratesCalc)
    totalForBooking.val(candRateCalc)
  }
  let totalForAll = 0
  $(".totalBooking").each(function() {

    totalForAll += Number($(this).val())

    ;
  });

  $("#overallTotal").val(totalForAll)
})



function overFlow() {
  $(".diaryItems").removeClass("hideDI").css("display", "block")
  $(".hiddenItems").remove()
  $(".moreItems").remove()
  for(t = 0; t<= $(".item").length; t++){
    let item = $(".item").eq(t)
      let parentHeight = $(item).height()
      for(i = 0; i <= $(item).children(".diaryItems").length - 1; i++){
        let position = $(item).children(".diaryItems").eq(i).position()
        let itemHeight = $(item).children(".diaryItems").eq(i).height()
        let posHeiCalc = Number(parentHeight) - Number(itemHeight)
        if (position.top >= posHeiCalc) {
          $(item).children(".diaryItems").eq(i).addClass("hideDI").css("display", "none")
        }
      }
      if(t == $(".item").length){
        overFlowList()
      }
  }
}

function overFlowList(){
  $(".item").each(function() {
    var hiddenItemsC = 0
    $(this).find(".hideDI").each(function(i) {
      hiddenItemsC = +i++;
    })
    var totalHidden = hiddenItemsC + 1
    if (totalHidden > 0) {
      $(this).find(".hideDI").first().before('<div class="hiddenItems"><i class="fa-solid fa-angle-down"></i>' + totalHidden + ' more bookings<i class="fa-solid fa-angle-down"></i></div>')
    }

  })
}


$(document).on("click", ".hiddenItems", function() {
  $(".popUp").remove()
  $(".bodyMain").append("<div class='popUp'></div>")
  let parentPosition = $(this).parent().position()
  let parentWidth = $(this).parent().width()
  let parentHeight = $(this).parent().height()
  let parentCh = $(this).parent().children()
  let topPos = Number(parentPosition.top)
  let leftPos = Number(parentPosition.left)
  let parentNext = $(this).parent().next()
  let parentPrev = $(this).parent().prev()
  $.each(parentCh, function() {
    let thisHeight = $(this).height()
    let parentChItem = $(this)
    let parentChId = Number($(this).index()) - 1
    totalHeight = +Number(thisHeight)
    if ($(this).hasClass("diaryItems")) {
      $(this).clone().appendTo(".popUp").removeClass("hideDI").css("display", "block").removeClass("widthx2").removeClass("widthx3").removeClass("widthx4").removeClass("widthx5").removeClass("widthx6").removeClass("widthx7")
    }
    $.each(parentNext.children("li"), function() {
      if ($(this).attr("data-objid") == parentChItem.attr("data-objId")) {
        $(".popUp").children().eq(parentChId).append('<i class="fa-solid fa-caret-right extendedRight"></i>')
      }
    })
    $.each(parentPrev.children("li"), function() {
      if ($(this).attr("data-objid") == parentChItem.attr("data-objId")) {
        $(".popUp").children().eq(parentChId).prepend('<i class="fa-solid fa-caret-left extendedLeft"></i>')
      }
    })
  })
  $(".popUp").css({
    top: topPos,
    left: leftPos,
    height: parentHeight,
    width: parentWidth
  },100)
  let heightNeeded = Number($('.popUp').children("li").length * 24)
  setTimeout(function(){
    $(".popUp").animate({'opacity':'100%', 'width':'20rem', 'height':heightNeeded, 'top': topPos - 30, 'left': leftPos - 54})
  },200)


})

$(document).click(function(clicked) {
  if (clicked.target.classList.contains("hiddenItems") || clicked.target.classList.contains("diaryItems")) {} else {
    $(".popUp").css("display", "none")
  }
})

var alaphabetArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

$(document).on("click", ".vortalListItem", function() {
  $(this).toggleClass("active")
  if($(this).hasClass("active")){
    let eachBooking = []

    $.ajax({
               url:'/articles',
               complete: function(results){
        let data = results.responseJSON
          for(i = 0; i <= data.length-1; i++){
              for(b = 0; b <= data[i].Bookings.length-1;b++){
                let booking = data[i].Bookings[b]
                Object.assign(booking, {headerId: data[i]._id})
                Object.assign(booking, {vortexRef: data[i].VortexRef})
                Object.assign(booking, {Status: data[i].Status})
                Object.assign(booking, {Organisation: data[i].Organisation})
                eachBooking.push(booking)
              }
          }

          filtered = eachBooking.filter((data) => data.vortexRef.startsWith("VB"))
              missingList(filtered)
        }
        })
        $(".unfinishedInfo").animate({

            'width': '20%',
        },100)
        $(".unfinishedInfo").animate({
            'left':'0',

        },200)
        setTimeout(function(){
          $(".unfinishedInfo").animate({
              'padding':'10px'
          },100)
        },50)


    $(".missingInfo").show()
    setTimeout(function() {
      overFlow();
    }, 900);
  } else {
    $(".unfinishedInfo").animate({
              'width': '0',
              'padding': '0'
    },100)
$(".unfinishedInfo").animate({
    'left':'-20%',
},600)
    setTimeout(function() {
      $(".missingInfo").hide()
      $(".missingInfoDiv").children(".specificMissing").remove();
    }, 50)
    overFlow()

  }
})

$(".sortByMissing").on("change", function(){
  let eachBooking = []

  $.ajax({
             url:'/articles',
             complete: function(results){
      let data = results.responseJSON
        for(i = 0; i <= data.length-1; i++){
            for(b = 0; b <= data[i].Bookings.length-1;b++){
              let booking = data[i].Bookings[b]
              Object.assign(booking, {headerId: data[i]._id})
              Object.assign(booking, {vortexRef: data[i].VortexRef})
              Object.assign(booking, {Status: data[i].Status})
              Object.assign(booking, {Organisation: data[i].Organisation})
              eachBooking.push(booking)
            }
          }


          filtered = eachBooking.filter((data) => data.vortexRef.startsWith("VB"))
          missingList(filtered)
      }

      })

})

function missingList(eachBooking){
  $(".specificMissing").remove()
  let headerid = ""
  let specificid = ""



eachBooking.sort(function(a,b){
return new Date(a.Start) - new Date(b.Start);
  })
if($(".sortByMissing").val() == 'Date: Newest - Oldest'){
  eachBooking.sort(function(a,b){
  return new Date(b.Start) - new Date(a.Start);
    })
}
      for(t = 0; t<= eachBooking.length -1; t++){
        let specific = eachBooking[t]
        let specificid = eachBooking[t]._id
        let bookingRef = eachBooking[t].vortexRef
        let headerId = eachBooking[t].headerId
        let organisation = eachBooking[t].Organisation
        let totalComplete = []
        let paperworkComplete = ""
        let registerComplete = ""
        let cardsComplete = ""
        let certsComplete = ""
        let invoiceComplete = ""
        let paidComplete = ""
        let trainerArray = []
        if($(specific.Paperwork).last()[0].Stage == "N/A" || $(specific.Paperwork).last()[0].Stage == "Recieved"){
          paperworkComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Register).last()[0].Stage == "N/A" || $(specific.Register).last()[0].Stage == "Recieved"){
          registerComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Cards).last()[0].Stage == "N/A" || $(specific.Cards).last()[0].Stage == "Sent"){
          cardsComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Certs).last()[0].Stage == "N/A" || $(specific.Certs).last()[0].Stage == "Sent"){
          certsComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Invoice).last()[0].Stage == "N/A" || $(specific.Invoice).last()[0].Stage == "Invoiced"){
          invoiceComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Paid).last()[0].Stage == "N/A" || $(specific.Paid).last()[0].Stage == "Paid"){
          paidComplete = "True"
          totalComplete.push("true")
        }

        let trainer
        if(specific.TrainerArray != undefined){

          for(tr = 0; tr <= specific.TrainerArray.length -1; tr++){
              if(specific.TrainerArray[tr].Trainer == "" ||specific.TrainerArray[tr].Trainer == undefined){
                trainer = "&nbsp;"
              } else {
                trainerArray.push(specific.TrainerArray[tr].Trainer.split(" ")[0].substring(0,1).toUpperCase() + specific.TrainerArray[tr].Trainer.split(" ")[1].substring(0,1).toUpperCase())
              }

          }
          trainer = trainerArray.join()
        } else {
          if(specific.Trainer.indexOf(" ") == -1){
            trainer = specific.Trainer
          } else {
            let trainerSplit = specific.Trainer.split(" ")
            trainer = trainerSplit[0].substr(0,1) + trainerSplit[1].substr(0,1)
          }
        }
        if(totalComplete.length < 6){
          let cancelled = ""
          if( $(specific.TrainerStage).last()[0].Stage == "Cancelled" ||eachBooking[t].Status == "Cancelled" ){
            cancelled = " - Cancelled"
          } else {
            cancelled =""
          }
          $(".missingInfoDiv").append('<div class="specificMissing" data-startDate="'+specific.Start+'" data-headerid="' + headerId + '" data-specificid="'+specific._id+'"><div class="missingSpecificInfo"><li>'+trainer + " - " + bookingRef + cancelled +'</li><li>'+organisation+'</li><li>'+new Date(specific.Start).toLocaleDateString("en-gb")+'</li><li>'+specific.AwardingBody+'</li></div><div class="specificTrafficLight"><div class="trafficLightLine"><div class="missingCheck register'+$(specific.Register).last()[0].Stage.toString().replaceAll("/","")+' ">Register</div><div class="missingCheck paperwork'+$(specific.Paperwork).last()[0].Stage.toString().replaceAll("/","")+'">Paperwork</div></div><div class="trafficLightLine"><div class="missingCheck cards'+$(specific.Cards).last()[0].Stage.toString().replaceAll("/","")+'">Card</div><div class="missingCheck certs'+$(specific.Certs).last()[0].Stage.toString().replaceAll("/","")+'">Cert</div></div><div class="trafficLightLine"><div class="missingCheck inv'+$(specific.Invoice).last()[0].Stage.toString().replaceAll("/","")+'">Invoice</div><div class="missingCheck paid'+$(specific.Paid).last()[0].Stage.toString().replaceAll("/","")+'">Paid</div></div></div></div>')
        }

      }
}

function specificMissingItem(headerid, specificId){

  $.post("/matrixRetrieve", {
    idOne:headerid
  }).done(function(data){
    let start = data
    if(start._id == headerid){
      for(b = 0; b <= start.Bookings.length -1; b++){
        let totalComplete = []
        let specific = start.Bookings[b]
        let specificid = specific._id
        let bookingRef = start.VortexRef
        let headerId = specific.headerId
        let organisation = specific.Organisation
        if($(specific.Paperwork).last()[0].Stage == "N/A" || $(specific.Paperwork).last()[0].Stage == "Recieved"){
          paperworkComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Register).last()[0].Stage == "N/A" || $(specific.Register).last()[0].Stage == "Recieved"){
          registerComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Cards).last()[0].Stage == "N/A" || $(specific.Cards).last()[0].Stage == "Sent"){
          cardsComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Certs).last()[0].Stage == "N/A" || $(specific.Certs).last()[0].Stage == "Sent"){
          certsComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Invoice).last()[0].Stage == "N/A" || $(specific.Invoice).last()[0].Stage == "Invoiced"){
          invoiceComplete = "True"
          totalComplete.push("true")
        }
        if($(specific.Paid).last()[0].Stage == "N/A" || $(specific.Paid).last()[0].Stage == "Paid"){
          paidComplete = "True"
          totalComplete.push("true")
        }
          let trainer
          if(specific.TrainerArray != undefined){
            let trainerArray = []
            for(tr = 0; tr <= specific.TrainerArray.length -1; tr++){
                if(specific.TrainerArray[tr].Trainer == "" ||specific.TrainerArray[tr].Trainer == undefined){
                  trainer = "&nbsp;"
                } else {
                  trainerArray.push(specific.TrainerArray[tr].Trainer.split(" ")[0].substring(0,1).toUpperCase() + specific.TrainerArray[tr].Trainer.split(" ")[1].substring(0,1).toUpperCase())
                }
            }
            trainer = trainerArray.join()
          } else {
            if(specific.Trainer.indexOf(" ") == -1){
              trainer = specific.Trainer
            } else {
              let trainerSplit = specific.Trainer.split(" ")
              trainer = trainerSplit[0].substr(0,1) + trainerSplit[1].substr(0,1)
            }
          }
          if(totalComplete.length < 6){
            let cancelled = ""
            if( $(specific.TrainerStage).last()[0].Stage == "Cancelled" ||start.Status == "Cancelled" ){
              cancelled = " - Cancelled"
            } else {
              cancelled =""
            }
          $(".missingInfoDiv").append('<div class="specificMissing" data-startDate="'+specific.Start+'" data-headerid="' + headerid + '" data-specificid="'+specific._id+'"><div class="missingSpecificInfo"><li>'+trainer + " - " + bookingRef + cancelled +'</li><li>'+organisation+'</li><li>'+new Date(specific.Start).toLocaleDateString("en-gb")+'</li><li>'+specific.AwardingBody+'</li></div><div class="specificTrafficLight"><div class="trafficLightLine"><div class="missingCheck register'+$(specific.Register).last()[0].Stage.toString().replaceAll("/","")+' ">Register</div><div class="missingCheck paperwork'+$(specific.Paperwork).last()[0].Stage.toString().replaceAll("/","")+'">Paperwork</div></div><div class="trafficLightLine"><div class="missingCheck cards'+$(specific.Cards).last()[0].Stage.toString().replaceAll("/","")+'">Card</div><div class="missingCheck certs'+$(specific.Certs).last()[0].Stage.toString().replaceAll("/","")+'">Cert</div></div><div class="trafficLightLine"><div class="missingCheck inv'+$(specific.Invoice).last()[0].Stage.toString().replaceAll("/","")+'">Invoice</div><div class="missingCheck paid'+$(specific.Paid).last()[0].Stage.toString().replaceAll("/","")+'">Paid</div></div></div></div>')
        } else {
          $(".missingInfoDiv").find("[data-specificid="+specificId+"]").eq(0).remove()

        }


        }
      }

  })
}

$(document).on("click", function(e){
  if($(e.target).closest(".generatePDFList").length == 0 ){
    if($(e.target).hasClass('generateItem') == false){
      $(".actionsList").slideUp().removeClass("openList")
      $(this).find(".fa-chevron-up").addClass("fa-chevron-down").removeClass("fa-chevron-up")
    }
  }

})

$(document).on("click", ".item", function(e) {
   if ($(".popUp").css("display") == "none") {
     if (e.target == this) {
       let dataStart = $(this).attr("data-datespan")
       let selectedDate = new Date(dataStart).toISOString().slice(0, 10)
       $("#start_date").val(selectedDate)
       newItemShow();
     }
   }
})

$(document).on("change", ".timeScale", function() {
  $(this).parent().parent().parent().find("#end_date").val('')
  $(this).parent().parent().parent().find("#total").val('')
  let lineStart = $(this).parent().parent().parent().find("#start_date").val()
  if ($(this).val() != "FullDay") {
    $(this).parent().parent().parent().find("#end_date").val(lineStart)
    $(this).parent().parent().parent().find("#total").val(0.5)
  }
})

$(document).on("click", ".courseAddition", function() {
  let firstName = $(this).parent().parent().children(".firstName").text()
  let surName = $(this).parent().parent().children(".surName").text()
  $(".courseUpdate").text(firstName + " " + surName + "'s course selection")
  $(".coursesAddition").slideDown()
  let userId = firstName.charAt(0).toUpperCase() + surName.charAt(0).toUpperCase() + $(this).closest(".matrixBody").children(".matrixVRef").text().replaceAll("-", '')
})

$(document).on("change", ".courseAttendedSelection", function(){
  if($(this).prop("checked") == true){
    $(this).val(true)
  } else {
    $(this).val(false)
  }

})

$(document).on("input", ".firstName", function() {
  if ($(this).text() != "" && $(this).parent().children(".userId").text() == "") {
    $(this).parent().addClass("New")
  } else {
    $(this).parent().removeClass("New")
  }
})

$(document).on("input", ".delegateData", function() {
  if ($(this).text() != "" && $(this).parent().children(".userId").text() != "") {
    $(this).parent().addClass("Updated")
  }
})




$(document).on("click", ".deleteRow", function() {
  $(this).toggleClass("inverted")
  $(this).parent().parent().toggleClass("Delete")
  $(this).parent().parent().removeClass("Updated")
  $(this).parent().parent().removeClass("New")
})


$(document).on("input", ".course", function() {
  let amountOfCourses = $(this).text()
  $(this).parent().children(".courseInfo").remove()
  for (i = 0; i < amountOfCourses; i++) {
    $(this).after("<td contenteditable='true' class='group" + i + " courseInfo delegateCourse delegateData'>Course Here</td><td contenteditable='true' class='group" + i + " courseInfo delegateStart delegateData'>StartDate Here</td><td contenteditable='true' class='group" + i + " courseInfo delegatePassFail delegateData'>Pass/Fail</td><td contenteditable='true' class='group" + i + " courseInfo delegateTrainer delegateData'>Trainer</td>")
  }

})

$(document).on("click", ".trainingSpecs, .cardsBooked", function() {
  let copyText = $(this).html().replaceAll('<li class="tbText">', '').replaceAll('<li class="invoiceSpecs"> ', '').replaceAll('<li class="invoiceSpecs">', '').replaceAll('<p class="cardsReq">', '').replace('              ', '').replaceAll('</p>', '').replaceAll('<li class="namesInvoice">', '').replaceAll('</li>', '').replaceAll('<li>','\n')
  navigator.clipboard.writeText(copyText)
delegateUpdate("Invoice")
})

$(document).on("click",".bookingHeader", function(){
  $(".newBookingWindow").slideUp()
  switch ($(this).index()) {
    case 0: $(".newBookingBookerInfo").slideDown()

      break;
    case 2: $(".newBookingBookingInfo").slideDown()

    break;
      case 4: $(".newBookingBookingConfirmation").slideDown()
  }
})

$(document).on("click", ".bookingHeader", function() {
  let org = $(".newOrgSelectInput").val()
  let booker = $("#newBookerSelect").val()
  let email = $("#bookerEmail").val()
  $(".detailsOverall").remove()
    $(".bRow").each(function(i) {
      let start = new Date($(this).find("#start_date").val()).toLocaleDateString("en-GB")
      let end = new Date($(this).find("#end_date").val()).toLocaleDateString("en-GB")
      let timeScale = $(this).find("#timeScale").val()
      let totalDays = $(this).find("#total").val()
      let trainer = $(this).find("#newtrainerSelect").val()
      let location = $(this).find("#siteLocation").val()
      let contact = $(this).find("#siteContact").val()
      let contactNumber = $(this).find("#siteContactNumber").val()
      let awardingBody = $(this).find("#awardingBody").val()
      let cardSelection = $(this).find("#cardReq").val()
      let rateType = $(this).find("#DayOrCandidate").val()
      let rate = $(this).find("#rate").val()
      let cardRate = $(this).find("#cardRate").val()
      let bookingTotal = $(this).find("#totalBooking").val()
      $(".detailsMain").after("<div class='flexRow detailsOverall'><div class='detailsBooking'><li> Full Day/AM/PM: " + timeScale + "</li><li>  Start Date: " + start + " - End Date:" + end + " - Total Days: " + totalDays + "</li><li>Trainer: " + trainer + "</li><li>Site Location: " + location + "</li><li>Site Contact: " + contact + "  -  Contact Number: " + contactNumber + "</li><li>Awarding Body: " + awardingBody + "  -  Cards Req: " + cardSelection + "</li></div><div class='detailsRates'><li>Rate Type: " + rateType + "</li><li>Course Rate:£ " + rate + "</li><li>Card Rate:£ " + cardRate + "</li><li>Course Total:£ " + bookingTotal + "</li></div></div>")
      $(this).find(".rowCT").each(function() {
        let courses = $(this).find("#coursePickerInput").val()
        let nporsTesting = $(this).find("#levelPicker").val()
        let delegates = $(this).find("#bookedDelegates").val()
        if (awardingBody == "NPORS") {
          $(".detailsBooking").after("<div class='detailsCourses'><li> Course:" + courses + "  -  Testing Type:" + nporsTesting + "  -  Delegates Booked: " + delegates + "</li></div>")
        } else {
          $(".detailsBooking").after("<div class='detailsCourses'><li> Course:" + courses + "  -  Delegates Booked: " + delegates + "</li></div>")
        }
      });

    })


    if ($(".trainerOnly").val() == "true") {
      $(".detailsTO").text("Trainer Only")
    } else {
      $(".detailsTO").text("")
    }
    $(".detailsOrg").text(org)
    $(".detailsBooker").text(booker)
    $(".detailsEmail").text(email)


})

$(document).on("change", "#status", function() {
  $(".confirmBooking").prop('disabled', false)
})

$(document).on("click", ".newUserOrg", function() {
  $(".newOrgBookerTable").append('<tr class="newOrgBookerRow"><td class="newBookerName" contenteditable="true"></td><td class="newBookerEmail" contenteditable="true"></td><td class="newBookerJob" contenteditable="true"></td><td><input type="checkbox" id="trainerForVortex" name="trainerForVortex"></td><td><input type="checkbox" id="accesstoVortal" name="trainerForVortex"></td><td><i class="fa-solid fa-trash removeBookerRow"></i></td></tr>')
})

$(document).on("click", ".removeBookerRow", function() {
  $(this).parent().parent().remove()
})

$(document).on("click", ".newTrainerTickBox, .cancelCheck", function() {
  if ($(this).prop("checked")) {
    $(this).val(true)
  } else {
    $(this).val(false)
  };
})

$(document).on("click", ".submitNewOrg", function() {

  let newOrgName = $("#newOrgName").val()
  let newOrgPostal = $("#newOrgPostal").val()
  let newOrgBilling = $("#newOrgBilling").val()
  let newOrgBookers = []

  $(".newOrgBookerRow").each(function() {
    let fullName = $(this).find(".newBookerName").text()
    let email = $(this).find(".newBookerEmail").text()
    let jobTitle = $(this).find(".newBookerJob").text()
    let trainerForVortex = $(this).find("#trainerForVortex").val()
    let vortalAccess = $(this).find("#accesstoVortal").val()
    newOrgBookers.push({
      FullName: fullName,
      EmailAddress: email,
      JobTitle: jobTitle,
      TrainerForVortex: trainerForVortex,
      VortalAccess: vortalAccess
    })
  })
  $.post("/organisationData",

    {
      postReqOrgTitle: newOrgName,
      postReqOrgPostal: newOrgPostal,
      postReqOrgBilling: newOrgBilling,
      postReqOrgUsers: newOrgBookers

    },
    function(data, status) {
      console.log(status);
    });


  $(".newOrgSelectInput").val(newOrgName)
  $(".newOrgSelect").children().remove()
  addFormData()
  orgSelected()
  $(".stepOne").children(".stepBody").slideDown()
  $(".newOrgbody").slideUp()
})


$('#newOrgName').on("change", function() {
  $('.orgWarning').remove()
  let newOrg = this
  let typedOrg = $(this).val()
  $.get("/companyData", function(data) {
    $.each(data, function() {
      if (typedOrg == this.CompanyName) {
        $(newOrg).parent().after('<p class="orgWarning">This organisaition already exists</p>')
      }
    })
  })
})

$(".newOrgSelectInput").on("click", function() {
  $(this).val('')
  $(".newOrgSelect").val('')
})

$(document).on("click", ".coursePickerSelect", function(){
  $(this).val('')
})

function addNewOrg() {
  $(".stepOne").children(".stepBody").slideUp()
  $(".newOrgbody").slideDown()
}

function newOrgCancel() {
  $(".stepOne").children(".stepBody").slideDown()
  $(".newOrgbody").slideUp()
}

$(document).on("submit","#delegatePhotoUp", function(event){
  event.preventDefault();
  let courseArray = []
  let courseRow = $(this).closest(".delegatesRow").find(".courseTable").children("tbody").children(".courseOptions")
  $.each(courseRow, function(){
    if($(this).children(".attendedItem").children(".courseAttendedSelection").val() == "true"){

      courseArray.push({
        Course: $(this).children(".courseItem").text(),
        Date: $(this).children(".dateAttendedItem").text(),
        PassFail: $(this).children(".passFailItem").text()
      })
    }
  })
  let firstName = $(this).closest(".delegatesRow").find(".firstName").text()
  let surname = $(this).closest(".delegatesRow").find(".surName").text()
  let userId = firstName.charAt(0).toUpperCase() + surname.charAt(0).toUpperCase() + Math.floor(Math.random() * 20) + $(".matrixVRef").text().replaceAll("-","")
  let dob = $(this).closest(".delegatesRow").find(".dateOfBirth").text()
  let company = $(this).closest(".delegatesRow").find(".company").text()
  let mobileNumber = $(this).closest(".delegatesRow").find(".mobileNumber").text()
  let emailAddress = $(this).closest(".delegatesRow").find(".emailAddress").text()
  var data = new FormData($(this)[0]);
  data.append('UpdateCourseId', $(".matrixBody").attr("data-headerid"))
  data.append('UserId', userId)
  data.append('firstName', firstName)
  data.append('surname', surname)
  data.append('dateOfBirth', dob)
  data.append('company', company)
  data.append('mobileNo', mobileNumber)
  data.append('emailAddress', emailAddress)
  data.append('CourseOverall',JSON.stringify(courseArray))
  $.ajax({
             url:'/insertDelegate',
             type: 'POST',
             contentType: false,
             processData: false,
             cache: false,
             data: data,
             error: function(){
                 alert('Error: Document could not be uploaded, please try again');
             },
             complete: delegateUpdate("Inserted")
         })
})

$(".addNewDoc").on("click",function(){
  $("#documentUpload").click()
})

$("#documentUpload").on("change",function(){
  $(".addNewDoc").addClass("spinningAffect")
  setTimeout(function(){
  $("#docsUploadForm").submit()
},1000)

})

$("#docsUploadForm").on("submit", function(event){
   event.preventDefault();
  var data = new FormData($('#docsUploadForm')[0]);
  data.append('selectedId', $(".matrixBody").attr("data-headerid"))
  data.append('selectedFolder', $(".addNewDoc").attr("data-docupload"))
  data.append('uploadedBy', $(".currentLoggedOn").attr("data-userfn"))
   $(".matrixDocsLoader").show()
    $.ajax({
      xhr: function() {
var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                    var percentComplete = Math.floor(Number((evt.loaded / evt.total) * 100))
                    var percentRemain = percentComplete - 100
                    $(".matrixDocsLoader").css({'background': 'linear-gradient(90deg, green '+percentComplete+'%, rgba(0, 0, 0, 0) '+percentRemain+'%)'})
                    $(".matrixDocsLoadPercentage").text(percentComplete + '%')
                  if(percentComplete == 100){
                    setTimeout(function(){
                      $(".matrixDocsLoadPercentage").text('Just Finishing Up!')
                    },100)
                  }
                    }
                  }, false);
                return xhr;
              },
               url:'/upload',
               type: 'POST',
               contentType: false,
               processData: false,
               cache: false,
               data: data,
               error: function(){
                   alert('Error: Document could not be uploaded, please try again');
               },
               complete: function(data) {
                 delegateUpdate("Documents")
                 $(".matrixDocsLoader").css({'background': ''}).hide()
                 $(".matrixDocsLoadPercentage").text('')


             }
           })
})

$(document).on('click','.matrixDocs', function(){
  $(".matrixDocs").removeClass("active")
  $(this).addClass("active")
  let selected = $(this).text().replaceAll(" ","").split("(")
  $(".addNewDoc").attr('data-docupload',selected[0])
  docUpload($(".matrixBody").attr("data-headerid"))
})

$(document).on("click",".documentDrop", function(){
  $(this).parent().parent().children().slideDown()
  $(this).removeClass("fa-caret-right documentDrop").addClass("fa-caret-down documentUp")
});

$(document).on("click", ".documentUp", function(){
  $(this).parent().parent().children(".hidden").slideUp()
$(this).removeClass("fa-caret-down documentUp").addClass("fa-caret-right documentDrop")
});


$(document).on("click", ".delegatePhoto", function(){
  $(".downloadImage").attr("href", $(this).attr("src"))
  $(".downloadImage")[0].click()
})

$(document).on("click", ".docDelete", function(){
  let matrixId = $(".matrixBody").attr("data-headerid")
  let docKey = $(this).closest(".docItem").attr("data-filekey")
  let docName = $(this).closest(".docItem").children().eq(0).text()
  let confirmation = confirm("Are you sure you want to delete " + docName + "? This will be permanently deleted from Vortal")
  if(confirmation == true){
    $.post("/docDelete",{
      deleteDocLocation: matrixId,
      deleteDocKey: docKey,
      deleteDocFolder: $(".addNewDoc").attr("data-docupload")
    }).done(function(){docUpload($(".matrixBody").attr("data-headerid"))})
  }
})

$(document).on("click",".docRename", function(){
if($(this).closest(".docItem").find(".nameChange").length == 0){
  $(this).closest(".docItem").children("td").eq(0).append('<span class="nameChange docExtra"><div><input type="text" name="" value="" class="form-control newDocName" placeholder="Enter New Name"></div><div class="docRenameExtra"><span class="docExtra"><i class="far fa-check-circle acceptChange"></i></span><span class="docExtra"><i class="far fa-times-circle cancelChange"></i></span></div></span>')

}
})

$(document).on("click",".cancelChange", function(){
  $(this).closest(".nameChange").remove()
})

$(document).on("click",".acceptChange", function(){

  $.post("/docNameChange", {
    docLocation: $(".matrixBody").attr("data-headerid"),
    docKey: $(this).closest(".docItem").attr("data-filekey"),
    docNew: $(this).closest(".nameChange").find(".newDocName").val(),
    docFolder: $('.addNewDoc').attr("data-docupload")
  }).done(function(){docUpload($(".matrixBody").attr("data-headerid"))})
})

$(document).on("click", ".fa-circle-user", function(){
$(this).closest(".delegatesRow").find("#delegatePhotoUpload").trigger('click')
})

$(document).on("change", "#delegatePhotoUpload", function(){
  if($(this)[0].files.length > 0){
    let createUrl = URL.createObjectURL(this.files[0])
    $(this).closest(".delegatesRow").children().eq(2).children(".fa-circle-user").remove()
    $(this).closest(".delegatesRow").children().eq(2).prepend('<img src='+createUrl+' alt="" class="delegatePhoto">')

  }
})


function delegateUpdate(updated, ref){
$(".delegatesRow").remove()
  $(".namesHere").remove()

  switch (updated) {

    case "Hol/Appt Booked":
    $(".flex-container").append('<div class="copiedpopUp hidden">Booked</div>')
          $(".copiedpopUp").fadeIn(400)
          setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
    $(".newHolidayBooking").slideUp()
    $(".newTrainerSelectHolAppt").val('')
    $(".holApptStart").val('')
     $(".holApptEnd").val('')
    $(".bookingSelect").val($(".form-select option:first").val())
    $(".newBookingFormTwo").animate({right: '-40%'})
    addOneMonth(+0)

    break;
    case "Inserted CV":      $(".flex-container").append('<div class="copiedpopUp hidden">CV Inserted</div>')
          $(".copiedpopUp").fadeIn(400)
          setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)

      break;
    case "Inserted":
      $(".flex-container").append('<div class="copiedpopUp hidden">Delegate Inserted</div>')
      $(".copiedpopUp").fadeIn(400)
      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
      delegateMatrixLoad()
      break;
      case "Updated":
      $(".flex-container").append('<div class="copiedpopUp hidden">Delegate Updated</div>')
      $(".copiedpopUp").fadeIn(400)
      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
      delegateMatrixLoad()
      break;
      case "Deleted":
      $(".flex-container").append('<div class="copiedpopUp deletedPopUp hidden">Delegate Deleted</div>')
      $(".copiedpopUp").fadeIn(400)
      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
      delegateMatrixLoad()
      break;
      case "Invoice":
      $(".flex-container").append('<div class="copiedpopUp hidden">Invoice Data Copied</div>')
      $(".copiedpopUp").fadeIn(400)
      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
        break;
          case "Archive":
          $.get("/articles", function(data){
            $.each(data, function(){
              if(this._id == $(".matrixBody").attr('data-headerid')){
                $(".archiveNumber").remove()
                $(".archiveBoxArea").append('<span class="archiveNumber">'+this.ArchiveBoxNumber+'</span>')
                $(".archiveInput").remove()
              }
            })
          }).done(function(){
            $(".archiveInput").val('')
            $(".taskDateStamp").val('')
          })
          $(".flex-container").append('<div class="copiedpopUp hidden">Archive Box Updated</div>')
          $(".copiedpopUp").fadeIn(400)
          setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
            break;

            case "Documents":
                  $(".addNewDoc").removeClass("spinningAffect")
                  $(".flex-container").append('<div class="copiedpopUp hidden">Document Uploaded</div>')
                  $(".copiedpopUp").fadeIn(400)
                  docUpload($(".matrixBody").attr("data-headerid"))
                  setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)
              break;
              case "Booking":                  $(".flex-container").append('<div class="copiedpopUp hidden">Booking Updated</div>')
                                $(".copiedpopUp").fadeIn(400)
                                setTimeout(function(){
                                  detailsUpdate($(".matrixBody").attr('data-headerid'),$(".itemBooking").eq(0))
                                },250)
                                notesUpdates($(".matrixBody").attr('data-headerid'))
                                setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})
                                },1400)

                break;
                case "Course Cancelled":      $(".flex-container").append('<div class="copiedpopUp deletedPopUp hidden">Course Cancelled</div>')
                      $(".copiedpopUp").fadeIn(400)
                      cancelOverlay()
                      detailsUpdate($(".matrixBody").attr('data-headerid'),$(".itemBooking").eq(0))
                      notesUpdates($(".matrixBody").attr('data-headerid'))

                      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})},1400)

                  break;

                case "OrgAdded":      $(".flex-container").append('<div class="copiedpopUp hidden">New Org Added</div>')
                                  $(".copiedpopUp").fadeIn(400)
                                  setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()})
                                  },1400)
                                  orgLoad()
                                  $('.newUser').show()
                                  $('.orgUserDetails').show()
                                  $(".employeeHeader").show()
                                  $(".newOrg").addClass("saveOrg").removeClass("newOrg")

                break;

                case "OrgUpdate":    $(".flex-container").append('<div class="copiedpopUp hidden">Org Updated</div>')
                                  $(".copiedpopUp").fadeIn(400)
                                  setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()
                                  orgDetails($('.orgOverlay').attr('data-orgid'))
                                }

                                      )
                                  },1400)

                  break;

                  case "CourseUpdate": $(".flex-container").append('<div class="copiedpopUp hidden">Courses Updated</div>')
                                    $(".copiedpopUp").fadeIn(400)
                                    $(".courseOverlay").animate({'right': '-30%'})
                                    $('.courseOverlay').removeClass("Open")
                                    $(".courseListItem").remove()
                                    $(".accredTyping").remove()
                                    $(".awardingBodyInput").slideUp()
                                    $("#awardingBodyPaperwork").prop('checked',false).val("No")
                                    $("#awardingBodyCerts").prop('checked',false).val("No")
                                    $("#awardingBodyCards").prop('checked',false).val("No")
                                    courseLoad()
                                    setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()
                                  })},1400)

                    break;
                    case "CourseAdded":  $(".flex-container").append('<div class="copiedpopUp hidden">Course Added - '+ref+'</div>')
                                      $(".copiedpopUp").fadeIn(400)
                                      setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()
                                      orgDetails($('.orgOverlay').attr('data-orgid'))
                                    }

                                          )
                                      },1400)

                      break;
                      case "TrainerCourseAdded":  $(".flex-container").append('<div class="copiedpopUp hidden">Trainer Course Added</div>')
                                        $(".copiedpopUp").fadeIn(400)
                                        setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()
                                      }

                                            )
                                        },1400)

                        break;
                        case "TrainerRegAdded": $(".flex-container").append('<div class="copiedpopUp hidden">Trainer Registration Added</div>')
                                          $(".copiedpopUp").fadeIn(400)
                                          setTimeout(function(){$(".copiedpopUp").fadeOut(1300, function(){$(".copiedpopUp").remove()
                                        }

                                              )
                                          },1400)

                          break;
  }
}



function docUpload(headerid){
  $("#docsUploadForm").trigger('reset')
  $(".docItem").remove()
  $.post("/matrixRetrieve", {
    idOne:headerid
  }).done(function(item){
    switch ($(".addNewDoc").attr('data-docupload')) {
      case "Register": $.each(item.Documents.Register, function(){
          $(".docDetails").append('<tr class="docItem" data-fileKey="'+this.FileKey+'" data-filelocation="'+this.Location+'"><td>'+this.FileName+'</td><td>'+this.Date+'</td><td>'+this.UploadedBy+'</td><td>'+this.Status+'</td><td><span class="docOptions docRename docExtra hidden"><i class="fas fa-edit"></i></span><span class="docOptions docDelete docExtra hidden"><i class="fas fa-trash"></i></span></td></tr>')
      })
        break;
        case "Cert/Card":$.each(item.Documents.CertificationOrCards, function(){
            $(".docDetails").append('<tr class="docItem" data-fileKey="'+this.FileKey+'" data-filelocation="'+this.Location+'"><td>'+this.FileName+'</td><td>'+this.Date+'</td><td>'+this.UploadedBy+'</td><td>'+this.Status+'</td><td><span class="docOptions docRename docExtra hidden"><i class="fas fa-edit"></i></span><span class="docOptions docDelete docExtra hidden"><i class="fas fa-trash"></i></span></td></tr>')
        })
        break;
        case "Frontsheet":$.each(item.Documents.FrontSheets, function(){
            $(".docDetails").append('<tr class="docItem" data-fileKey="'+this.FileKey+'" data-filelocation="'+this.Location+'"><td>'+this.FileName+'</td><td>'+this.Date+'</td><td>'+this.UploadedBy+'</td><td>'+this.Status+'</td><td><span class="docOptions docRename docExtra hidden"><i class="fas fa-edit"></i></span><span class="docOptions docDelete docExtra hidden"><i class="fas fa-trash"></i></span></td></tr>')
        })
        break;
        case "Paperwork":
        $.each(item.Documents.Paperwork, function(){
            $(".docDetails").append('<tr class="docItem" data-fileKey="'+this.FileKey+'" data-filelocation="'+this.Location+'"><td>'+this.FileName+'</td><td>'+this.Date+'</td><td>'+this.UploadedBy+'</td><td>'+this.Status+'</td><td><span class="docOptions docRename docExtra hidden"><i class="fas fa-edit"></i></span><span class="docOptions docDelete docExtra hidden"><i class="fas fa-trash"></i></span></td></tr>')
        })
          break;

          case "Misc":
          $.each(item.Documents.Misc, function(){
              $(".docDetails").append('<tr class="docItem" data-fileKey="'+this.FileKey+'" data-filelocation="'+this.Location+'"><td>'+this.FileName+'</td><td>'+this.Date+'</td><td>'+this.UploadedBy+'</td><td>'+this.Status+'</td><td><span class="docOptions docRename docExtra hidden"><i class="fas fa-edit"></i></span><span class="docOptions docDelete docExtra hidden"><i class="fas fa-trash"></i></span></td></tr>')
          })
            break;

    }
    let regDoc = item.Documents.Register
    let paperwork = item.Documents.Paperwork
    let front = item.Documents.FrontSheets
    let coc = item.Documents.CertificationOrCards
    let misc = item.Documents.Misc
    $(".docNumber").remove()
    $(".matrixDocs").each(function(){
      switch ($(this).text()) {
        case "Register": $(this).append("<span class='docNumber'> ("+ regDoc.length + ") <span>")

          break;
          case "Paperwork": $(this).append("<span class='docNumber'> ("+ paperwork.length + ") <span>")

            break;
            case "Frontsheet": $(this).append("<span class='docNumber'> ("+ front.length + ") <span>")

              break;
              case "Cert/Card(s)": $(this).append("<span class='docNumber'> ("+ coc.length + ") <span>")

                break;
                case "Misc": $(this).append("<span class='docNumber'> ("+ misc.length + ") <span>")

                  break;

      }
    })
  })
}

$(document).on({
    mouseenter: function () {
      $(this).find(".docOptions").removeClass("hidden")
    },
    mouseleave: function () {
$(this).find(".docOptions").addClass("hidden")
    }
}, ".docItem");

$(document).on("click",".docItem, .listTrainerDocs", function(e){
  let target = e.target
  if(!$(target).closest("span").hasClass('docExtra')){
  $(".OverlayThree").animate({'right': '0'})
  $(".matrixViewer").attr("data", '')
  $(".matrixViewer").attr("data", $(this).attr('data-filelocation')).removeClass("hidden")
}
})

$(document).on("click",".hideViewer", function(){
  $(".OverlayThree").animate({'right': '-45%'})
  $(".matrixViewer").attr("data", '').addClass("hidden")
})

///to delete? ///
$(".saveDelegates").on("click", function(){
    setTimeout(function(){
      $(".delegatesRow").remove()
      $(".namesHere").remove()
      $.ajax({
                 url:'/articles',
                 complete: function(results){
          let data = results.responseJSON
          $.each(data, function(){
            if(this._id == $(".matrixBody").attr("data-headerid")){
              let delegates = this.Delegates
              $.each(delegates, function(i) {
                let userId = this.UserId
                let firstName = this.FirstName
                let surName = this.Surname
                let dob = this.DateOfBirth
                let company = this.Company
                let mobileNumber = this.MobileNumber
                let emailAddress = this.EmailAddress
                let courseArray = this.CoursesAttended
                let imageLocation = this.ImageLocation
                let imageKey = this.ImageKey
                var coursesStructure = []
                var courseLength = 0
                $(courseArray).each(function(i) {
                  courseLength = Number(i) + 1
                  let course = this.Course
                  let date = this.Date
                  let passFail = this.PassFail
                  coursesStructure.push('<tr class="courseOptions"><td class="courseItem coursesCell">'+course+'</td><td class="dateAttendedItem coursePadding" contenteditable="true">'+date+'</td><td class="passFailItem coursePadding"contenteditable="true">'+passFail+'</td><td class="coursePadding" contenteditable="true"></td></tr>')
                })
                var imageTest = ""
                if(imageLocation == "" || imageLocation == null || imageLocation == undefined){
                  imageTest = '<td class="delegateData delImage"><i class="fa-solid fa-circle-user"></i><button type="button" name="button" class="btn btn-primary btn-sm changeImage hidden">Change Photo</button></td>'
                } else {
                  imageTest = '<td class="delegateData delImage"><img src='+imageLocation+' alt="" class="delegatePhoto"><button type="button" name="button" class="btn btn-primary btn-sm changeImage hidden">Change Photo</button><p class="imgKey hidden">'+imageKey+'</p></td>'
                }

                if(courseArray == null || courseArray == undefined || courseArray == ""){
                  $(".delegateHeadRow").after('<tr class="delegatesRow"><td class="delegateData hidden"><form method="post" enctype="multipart/form-data" id="delegatePhotoChange"><input type="file" name="changePhoto" value="" id="changePhoto"></form></td><td class="delegateData"><i class="fa-solid fa-trash deleteRow"></i></td>'+imageTest+'<td class="delegateData hide userId">' + userId + '</td><td contenteditable="true" class="delegateData firstName">' + firstName + '</td><td contenteditable="true" class="delegateData surName">' + surName + '</td><td contenteditable="true" class="delegateData dateOfBirth">' + dob + '</td><td contenteditable="true" class="delegateData company">' + company + '</td><td contenteditable="true" class="delegateData mobileNumber">' + mobileNumber + '</td><td contenteditable="true" class="delegateData emailAddress">' + emailAddress + '</td><td class="delegateData course">' + courseLength + '<button type="button" name="button" class="btn btn-light addCourses"><i class="fas fa-plus"></i></button></td></tr>')
                } else {
                  $(".delegateHeadRow").after('<tr class="delegatesRow"><td class="delegateData hidden"><form method="post" enctype="multipart/form-data" id="delegatePhotoChange"><input type="file" name="changePhoto" value="" id="changePhoto"></form></td><td class="delegateData"><i class="fa-solid fa-trash deleteRow"></i></td>'+imageTest+'<td class="delegateData hide userId">' + userId + '</td><td contenteditable="true" class="delegateData firstName">' + firstName + '</td><td contenteditable="true" class="delegateData surName">' + surName + '</td><td contenteditable="true" class="delegateData dateOfBirth">' + dob + '</td><td contenteditable="true" class="delegateData company">' + company + '</td><td contenteditable="true" class="delegateData mobileNumber">' + mobileNumber + '</td><td contenteditable="true" class="delegateData emailAddress">' + emailAddress + '</td><td class="delegateData course">' + courseLength + '<button type="button" name="button" class="btn btn-light addCourses"><i class="fas fa-plus"></i></button></td><td><table class="courseTable"><tr class="detailsCourses"><th>Course</th><th>Date</th><th>Pass/Fail</th>'+coursesStructure.toString().replaceAll(",","")+'</table></td></tr>')

                }


                $(".cardsReq").append('<li class="namesInvoice namesHere">' + firstName + ' ' + surName + '</li>')
              })
            }
          })
        }
      })



    }, 80)
})


$(document).on("input", ".mBookings, .bookingDetails", function(){
  $(this).closest(".section1").addClass("Updated")

})

$( ".itemHover" ).hover(

  function() {
    let attribute = $(this).attr("data-navitem")
    let location = $(this).position()
    let locationLeft = location.left + 54
    let locationTop = location.top + 10
    $(this).css({  'color': 'white',
      'background-color': '#87A8D0'})
      $(".navTag").text(attribute)
      $(".navTag").css({top: locationTop, left: locationLeft});
      $(".navTag").show()


  }, function() {
    $(".navTag").hide(0);
    $(this).css({  'color': '',
      'background-color': ''})
  }
);


$(".vortalNavItem").on("click", function(){
  $(".archiveInput").remove()
  $(".vortalNavItem").removeClass("active")
  $(".pdfViewer").hide()
  $(".overLayCandidate").animate({'right': '-70%'})
  $('.overLayCandidate').removeClass("Open")
  $(".orgOverlay").animate({'right': '-70%'})
  $('.orgOverlay').removeClass("Open")
  $(".courseOverlay").animate({'right': '-30%'})
  $('.courseOverlay').removeClass("Open")
  $(this).addClass("active")
  if($(".matrixBody").find(".Updated").length > 0){
    let confirmation = confirm("You are trying to leave this page with unsaved items. If you close this page now it will not save. Do you want to continue?")
    if(confirmation == true){
      openWindow($(this))
    }
  } else {
    openWindow($(this))
  }

})

function openWindow(selected) {
  $(".matrixBody").find(".Updated").removeClass("Updated")
  switch ($(selected).attr("data-navitem")) {
    case "Dashboard": $(".vortalWindow").slideUp(400)
                      $(".dashboardMain").css({
                          "height": "95vh",
                          "width": "95vw"
                        })
                      $(".dashboardMain").delay(400).slideDown(400);


      break;
    case "Diary":
    $(".vortalWindow").slideUp(400)
                $(".bodyMain").delay(400).slideDown(400);
                  $(".diaryItems").remove()
                addOneMonth(0)

      break;

      case "Documents":$(".vortalWindow").slideUp(400)
                      $(".bodyMain").css({
                        "height": "95vh",
                        "width": "95vw"
                      })
                      documentsLoad()
                  $(".documentsMain").delay(400).slideDown(400);

        break;

        case "Delegates": $(".vortalWindow").slideUp(400)
                          $(".delegatesMain").delay(400).slideDown(400);
                          delegateLoad()
          break;
        case "Organisations": $(".vortalWindow").slideUp(400)
                          $(".orgMain").delay(400).slideDown(400)
                          orgLoad()
          break;

          case "Courses": $(".vortalWindow").slideUp(400)
                            $(".coursesMain").delay(400).slideDown(400)
                            courseLoad()
            break;

            case "Trainers":$(".vortalWindow").slideUp(400)
                              $(".trainersMain").delay(400).slideDown(400)
                              trainerMatrixLoad()
              break;
  }
}

function documentsLoad(){
  $(".folderName").remove()
  $.ajax({
             url:'/articles',
             complete: function(results){
      let data = results.responseJSON
    $.each(data, function(){
      if(this.VortexRef.startsWith('VB-'))
      $(".docTableMain").append('<tr class="folderName" data-headerId="'+this._id+'"><td><i class="fas fa-folder documentFolders"></i></td><td>'+this.VortexRef+'</td><td>'+this.Organisation+'</td></tr>')
    })
  }
  })
}

$(document).on("click", ".folderName",function(){
  $(".pdfViewer").hide()
  $(".docTableFolder").show()
  $(".innerFolderView").hide()
  $(".currentlyFolder").remove()
 $(".currentlyOpen").remove()
 $(".folderName").removeClass("selectedFolder")
 $(this).addClass("selectedFolder")
 $(this).append('<td class="currentlyOpen"> <i class="fas fa-chevron-right openDocIndicator"></i> </td>')
$(".registerCount").text("")
  let selectedId = $(this).attr("data-headerid")

  $.ajax({
             url:'/articles',
             complete: function(results){
      let data = results.responseJSON
    $.each(data, function(){
      if(this._id == selectedId){
                      $(".registerCount").text("(" + this.Documents.Register.length + ")")
                        $(".paperworkCount").text("(" + this.Documents.Paperwork.length + ")")
                        $(".frontSheets").text("(" + this.Documents.FrontSheets.length + ")")
                          $(".otherCount").text("(" + this.Documents.Misc.length + ")")
                            $(".cotCount").text("(" + this.Documents.CertificationOrCards.length + ")")
      }
    })
  }
  })

})


$(document).on("click", ".viewFolder", function(){
  $(".innerFolderView").show()
  $(".itemisedFile").remove()
  $(".currentlyFolder").remove()
  $(this).append('<span class="currentlyFolder"> <i class="fas fa-chevron-right openDocIndicator"></i> </span>')
  let string = $(this).text()
  switch (string.slice(0, string.length - 5)) {
    case "Register":
    $.ajax({
               url:'/articles',
               complete: function(results){
        let data = results.responseJSON
              $.each(data, function(){
                if(this._id == $(".selectedFolder").attr("data-headerid"))
                $.each(this.Documents.Register, function(){
                  $(".innerFolderView").append('<tr class="itemisedFile"><td data-docLink="'+this.Location+'">'+this.FileName+'</td></tr>')
                })
              })
            }
            })
      break;
      case "Paperwork":
      $.ajax({
                 url:'/articles',
                 complete: function(results){
          let data = results.responseJSON
                $.each(data, function(){
                  if(this._id == $(".selectedFolder").attr("data-headerid"))
                  $.each(this.Documents.Paperwork, function(){
                    $(".innerFolderView").append('<tr class="itemisedFile"><td data-docLink="'+this.Location+'">'+this.FileName+'</td></tr>')
                  })
                })
              }
              })
        break;
        case "FrontSheet(s)":
        $.ajax({
                   url:'/articles',
                   complete: function(results){
            let data = results.responseJSON
                  $.each(data, function(){
                    if(this._id == $(".selectedFolder").attr("data-headerid"))
                    $.each(this.Documents.FrontSheets, function(){
                      $(".innerFolderView").append('<tr class="itemisedFile"><td data-docLink="'+this.Location+'">'+this.FileName+'</td></tr>')
                    })
                  })
                }
                })
          break;
        case "Certification & Cards":
        $.ajax({
                   url:'/articles',
                   complete: function(results){
            let data = results.responseJSON
                  $.each(data, function(){
                    if(this._id == $(".selectedFolder").attr("data-headerid"))
                    $.each(this.Documents.CertificationOrCards, function(){
                      $(".innerFolderView").append('<tr class="itemisedFile"><td data-docLink="'+this.Location+'">'+this.FileName+'</td></tr>')
                    })
                  })
                }
                })
          break;
          case "Other Docs":
          $.ajax({
                     url:'/articles',
                     complete: function(results){
              let data = results.responseJSON
                    $.each(data, function(){
                      if(this._id == $(".selectedFolder").attr("data-headerid"))
                      $.each(this.Documents.Misc, function(){
                        $(".innerFolderView").append('<tr class="itemisedFile"><td data-docLink="'+this.Location+'">'+this.FileName+'</td></tr>')
                      })
                    })
                  }
                  })
            break;

  }
})


$(document).on("click", ".itemisedFile", function(){
  let docLink = $(this).children().attr("data-docLink");
  $(".pdfViewer").attr("src", " ")
  $(".pdfViewer").attr("src", docLink).show()
})

$(".courseSearchMissing").on("input", function(){
  $.ajaxSetup({
    async: false
  });
let currentInput = $(this).val()
let courseId = []
if( !$(this).val()){
  $(".specificMissing").each(function(){
    $(this).show()
  })
} else {

  switch ($(".searchOptions").val()) {
    case "Reference":
    $.ajax({
               url:'/articles',
               complete: function(results){
        let data = results.responseJSON
      $.each(data, function(i){
        if(data[i].VortexRef.includes( currentInput)){
          courseId.push(this._id);
        }
      });
    }
    });
      break;
      case "Delegate":
      $.ajax({
                 url:'/articles',
                 complete: function(results){
          let data = results.responseJSON
        $.each(data, function(i){
          delegates = this.Delegates
          let delegateId = this._id
          $.each(delegates, function(){
            let fullName = this.FirstName + " " + this.Surname
            if(fullName.includes( currentInput.charAt(0).toUpperCase() + currentInput.slice(1))){
              courseId.push(delegateId);
            }
          })
        });
      }
      });

        break;
        case "Organisation":
        $.ajax({
                   url:'/articles',
                   complete: function(results){
            let data = results.responseJSON
          $.each(data, function(i){
            if(this.Organisation.includes( currentInput.charAt(0).toUpperCase() + currentInput.slice(1))){
              courseId.push(this._id);
            }
          });
        }
        });
          break;
  }
$(".specificMissing").each(function(){
  if($.inArray($(this).attr("data-headerid"), courseId) == -1){
    $(this).hide()
  }
})
}
})



$(".fa-magnifying-glass").on("click", function(){
  $(".searchBox").show()
  $(".searchBox").animate({left: 72}, 400)
})

$(".closeSearch").on("click", function(){
  $(".searchBox").animate({left: -640}, 400)
  $(".searchBox").hide(450)
})

$(".searchTextBox").on("change", function(){
  $(".foundScroll").children().remove()
  let selected = $(".searchDropDown").val()
  let currentSearch = $(this).val()
  $.ajax({
             url:'/articles',
             complete: function(results){
      let data = results.responseJSON
    switch (selected) {
      case "VortexRef":
      $(".foundScroll").append("<div class='foundHead'><div>Ref & Company</div><div> Courses Booked </div><div>Delegates</div></div>")
      for(i = 0; i <= data.length-1;i++){
        let specificData = data[i]
        if(specificData.VortexRef.includes(currentSearch)){
                let bookingsArray = []
                let delegateArray = []
                for(t = 0; t<= specificData.Bookings.length -1; t++){
                  let specificBooking = specificData.Bookings[t]
                  for (b = 0; b <= specificBooking.CourseInfo.length -1; b++){
                    let course = specificBooking.CourseInfo[b]
                    let courseString = "<div>" + course.Course + "</div>"
                    bookingsArray.push(courseString)
                  }
                  if(specificBooking.Delegates == undefined || specificBooking.Delegates == null || specificBooking.Delegates == ""){
                    delegateArray.push("")} else {
                    for(d=0; d<= specificBooking.Delegates.length-1;d++){
                      let currentDelegate = specificBooking.Delegates[d]
                      let delegateString = "<div>"+currentDelegate.FirstName+ " "+ currentDelegate.Surname +"</div>"
                      delegateArray.push(delegateString)
                    }
                  }
                }
                    $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificData._id+'"><div>'+specificData.VortexRef+' - '+specificData.Organisation+'</div><div class="bookingList">'+bookingsArray.toString().replaceAll(",","")+'</div><div class="delegateList">'+delegateArray.toString().replaceAll(",","")+'</div></div>')

        }
      }

        break;

      case "Delegate":
      $(".foundScroll").append("<div class='foundHead'><div class='delSearchImage'>"+"&nbsp;"+"</div><div> Full Name </div><div>Vortex Ref</div><div>Courses</div></div>")
      for(i = 0; i <= data.length-1;i++){
        let specificData = data[i]
        let specificId = data[i]._id
        let delegateFound = ""

                for(t = 0; t<= specificData.Bookings.length -1; t++){
                  let courses = []
                  let specificBooking = specificData.Bookings[t]
                  if(specificBooking.Delegates == undefined || specificBooking.Delegates == null || specificBooking.Delegates == ""){
                    delegateFound = ""
                  } else {
                    for(b = 0; b <= specificBooking.Delegates.length-1; b++){
                      let specificDelegate = specificBooking.Delegates[b]
                      let fullName = specificDelegate.FirstName + ' ' + specificDelegate.Surname
                      let coursesAtt = []
                      if(fullName.toLowerCase().includes(currentSearch.toLowerCase())){
                        for(c = 0; c <= specificDelegate.Course[0].length -1; c++){
                          let specificCourse = specificDelegate.Course[0][c]
                          let courseString = "<li>" + specificCourse.Course + " - " + new Date(specificCourse.Date).toLocaleDateString("en-GB") + " - " + specificCourse.PassFail + "</li>"
                          courses.push(courseString)
                        }
                        if(specificDelegate.ImageLocation == null ||specificDelegate.ImageLocation == undefined ||specificDelegate.ImageLocation == "" ){
                          $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificId+'"><div class="delSearchImage"><div class="seachEnginePlaceholder"></div></div><div>'+fullName+'</div><div>'+specificData.VortexRef+'</div><div>'+courses.toString().replaceAll(",","")+'</div></div>')
                        } else {
                          $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificId+'"><div class="delSearchImage"><img src="'+specificDelegate.ImageLocation+'" alt="" class="delSearchPhoto"></div><div>'+fullName+'</div><div>'+specificData.VortexRef+'</div><div>'+courses.toString().replaceAll(",","")+'</div></div>')
                        }
                      }
                    }
                  }
                }
      }

        break;

        case "Organisation":
                $(".foundScroll").append("<div class='foundHead'><div>Organisation</div><div>Vortex Ref</div><div>Date(s)</div></div>")

        for(i = 0; i <= data.length-1;i++){
          let specificData = data[i]
          let specificId = data[i]._id
          let bookingFound = ""
          var fullbookingArr = []
          var courseArry =[]
          if(specificData.Organisation == "" || specificData.Organisation == undefined ){
            bookingFound = ""}
            else {
            if(specificData.Organisation.toLowerCase().includes(currentSearch)){
                    for(b = 0; b <= specificData.Bookings.length -1; b++){
                      let specificBooking = specificData.Bookings[b]
                      let dates = "<div>"+ new Date(specificBooking.Start).toLocaleDateString("en-GB") + " - " + new Date(specificBooking.End).toLocaleDateString("en-GB") + "</div>"
                      for (c = 0; c <= specificBooking.CourseInfo.length-1 ; c++){
                        let courseSpec = specificBooking.CourseInfo[c]
                        let courseString = "<li>" + courseSpec.Course + "</li>"
                        courseArry.push(courseString)
                      }
                      let fullString = "<div>" + dates + courseArry.toString().replaceAll(",","") + "</div>"
                      fullbookingArr.push(fullString)
                    }

                  $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificId+'"><div>'+specificData.Organisation+'</div><div>'+specificData.VortexRef+'</div><div class="delegateList">'+fullbookingArr.toString().replaceAll(",","")+'</div></div>')
            }
          }
        }
          break;
          case "InvNo":
          $(".foundScroll").append("<div class='foundHead'><div>Invoice Number</div><div>Vortex Ref</div><div>Organisation</div></div>")
          for(i = 0; i <= data.length-1;i++){
            let specificData = data[i]
            let specificId = data[i]._id
            let bookingFound = ""
              for(b = 0 ; b <= specificData.Bookings.length -1; b++){
                let specificBooking = specificData.Bookings[b]
                if(specificBooking.Invoice != undefined || specificBooking.Invoice != null){
                    let specifcInv = specificBooking.Invoice[specificBooking.Invoice.length-1]
                    if(specifcInv.Stage == "Invoiced"){
                      if(specifcInv.InvNo.toLowerCase().includes(currentSearch)){
                        $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificId+'"><div>'+specifcInv.InvNo+'</div><div>'+specificData.VortexRef+'</div><div class="delegateList">'+specificData.Organisation+'</div></div>')
                      }
                    }
                }
              }
          }
            break;
          case "RefNumber":
          $(".foundScroll").append("<div class='foundHead'><div>Ref Number</div><div>Vortex Ref</div><div>Organisation</div></div>")
          for(i = 0; i <= data.length-1;i++){
            let specificData = data[i]
            let specificId = data[i]._id
            let bookingFound = ""
              for(b = 0 ; b <= specificData.Bookings.length -1; b++){
                let specificBooking = specificData.Bookings[b]
                if(specificBooking.RefNumber == undefined || specificBooking.RefNumber == null || specificBooking.RefNumber == ""){
                  bookingFound = ""
                } else {
                  if(specificBooking.RefNumber.toLowerCase().includes(currentSearch)){
                    $(".foundScroll").append('<div class="foundItem" data-headerid="'+specificId+'"><div>'+specificBooking.RefNumber+'</div><div>'+specificData.VortexRef+'</div><div class="delegateList">'+specificData.Organisation+'</div></div>')
                  }
                }

              }
          }
            break;
    }
  }
  })
})

$(".searchDropDown").on("change", function(){
    $('.searchTextBox').val("")
    $(".foundScroll").children().remove()
if($(this).val() == "Start"){
  $('.searchTextBox').attr("type", "date")
} else {
  $('.searchTextBox').attr("type", "text")
}
})



$(document).on("change",".archiveInput", function(){
  $(this).closest(".taskType").find(".taskDateStamp").val(new Date().toLocaleDateString("en-gb"))
})


$(document).on({
    mouseenter: function () {
      let hoverId = $(this).attr("data-objid")
        $(".diaryItems").each(function(){
          if($(this).attr("data-objid") == hoverId){
            $(this).css({
              'background-color': '#3F72AF',
              'color': "white",
              "cursor": "pointer"
          })
          }
        })
    },
    mouseleave: function () {
      let hoverId = $(this).attr("data-objid")
        $(".diaryItems").each(function(){
          if($(this).attr("data-objid") == hoverId){
            $(this).css({
              'background-color': '',
              'color': "",
              "cursor": ""
          })
          }
        })
    }
}, ".diaryItems:not(.temporary)");

$(document).on("click",".closeBooking", function(){
  let item = $(".clickedBooking")
  if($('.OverlayOne').hasClass("Open")){
    if($('.OverlayOne').hasClass("modified")){
      let question = confirm("This booking has been modified. Are you sure you want to leave without saving?")

        if(question == true){
          $(item).removeClass("clickedBooking")
          $(".OverlayOne").animate({'right': '-70%'})
          $('.OverlayOne').removeClass("Open")
          $('.OverlayOne').removeClass("modified")
          $(".actionsList").slideUp().removeClass("openList")
      }
    } else {
      $(item).removeClass("clickedBooking")
      $(".OverlayOne").animate({'right': '-70%'})
      $('.OverlayOne').removeClass("Open")
      $('.OverlayOne').removeClass("modified")
      $(".actionsList").slideUp().removeClass("openList")
    }
  }
})

$(document).on("change",".stagesDetails ,.bookingDetails, .courseDetailsInner", function(){
  $(".OverlayOne").addClass("modified")
})

$(document).on("click",".itemBooking", function(){
  $(".itemBooking").removeClass("clickedBooking")
    $(this).addClass("clickedBooking")
    detailsUpdate($(".matrixBody").attr('data-headerid'),$(this))
})

function delegateMatrixLoad(){
  let delArr = []
  if(delegateView = "closed")
  $.post("/matrixRetrieve", {
    idOne:$(".matrixBody").attr('data-headerid')
  }).done(function(data){
    for(i = 0; i <= data.Bookings.length-1; i++){
      let booking = data.Bookings[i]
      if(booking._id == $(".clickedBooking").attr('data-specificid')){
        if(booking.Delegates != undefined){
          for(e = 0; e <= booking.Delegates.length - 1; e++){
            let delegate = booking.Delegates[e]
            let delCourseArr = []
            let editCourseArr = []
            let signInArr = []
            delArr.push('<li>'+delegate.FirstName+ "  "+ delegate.Surname +'</li>')
            if(delegate.Course != undefined){
              for(d = 0; d <= delegate.Course[0].length - 1; d++){
                let courseD = delegate.Course[0][d]
                if(courseD.PassFail == "Fail"){
                  delCourseArr.push('<li >Course Details : '+courseD.Course+ ' - '+ new Date(courseD.Date).toLocaleDateString('en-gb') + ' - '+courseD.PassFail+'</li><li class="hidden">Reason :'+courseD.FailReason+'</li>')
                } else {
                delCourseArr.push('<li>Course Details : '+courseD.Course+ ' - '+ new Date(courseD.Date).toLocaleDateString('en-gb') + ' - '+courseD.PassFail+'</li>')
              }
              }
            }
            if(delegate.SignIn != undefined || delegate.SignIn != null){
              for(s = 0; s<= delegate.SignIn.length-1; s++){
                signInArr.push('<li class="hidden">Date: '+delegate.SignIn[s].Date+ ' - ' +'Trainer: '+delegate.SignIn[s].Trainer+'</li>')
              }
            }

            let location = ""
            let key = ""
            if(delegate.ImageLocation == undefined){
              location = '/Images/vortalPortraitStandIn.png'
            } else {
              location = delegate.ImageLocation
              key = "data-imagekey='" + delegate.ImageKey + "'"
            }
            $(".delegatesScroll").append('<div class="delegateDetailsMatrix" data-userid="'+delegate.UserId+'"><div class="imgPlaceHolder"><div class="delegateImg" '+key+'style="background-image: url('+location+');"></div><button type="button" name="button" class="editPhoto">Edit</button></div><div class="baseInfo"><div><li>Full Name : '+ delegate.FirstName+' '+delegate.Surname+'</li><li class="">D.O.B : '+new Date(delegate.DateOfBirth).toLocaleDateString('en-gb')+'</li><li class="">Contact Number : '+delegate.MobileNumber+'</li><li class="">Email Address : '+delegate.EmailAddress+'</li><li class="">Organisation : '+delegate.Company+'</li></div><div>'+delCourseArr.toString().replaceAll(",","")+'</div></div><div></div><div class="editInfo"><i class="fas fa-edit"></i> Edit </div><div class="deleteUser"><i class="fa-solid fa-trash-can"></i> Delete </div><div class="signInInfo"> Sign In Details : '+signInArr.toString().replaceAll(",","")+'</div>')
                            }
        }
      }

    }
  })
}

function detailsUpdate(headerid,selected){
  docUpload(headerid)
  notesUpdates(headerid)
  $(".removeLastTrainer").attr('disabled',true)
  $(".courseRowsMatrix").remove()
  $(".sectionOneMid").children().remove()
  $(".matrixBookingSpecific").remove()
  $(".changeLogItem").remove()
  $("#matrixCardSelect").children().remove()
  $(".nporsNotificationData").hide()
$("#matrixNotificationType").val('')
  var bookedCourses = []
  var selectedtestingType = []
  var nporsTesting=["NPORS Testing Type", "Novice", "Refresher","EWT","Conversion"]
  var cardSelected = ""
  $(".delegateDetailsMatrix").remove()
  $(".testingType").show()
  let selectedId = $(selected).attr('data-specificid')
  let oneID = headerid
  $.post("/matrixRetrieve", {
    idOne:headerid
  }).done(function(item){
    for(t = 0; t<= item.Bookings.length -1; t++){
      let booking = item.Bookings[t]
      $("#bookerNameMatrix").val(item.BookerName)
      if(booking._id == selectedId){
        let delArr = []
        let delTotal = 0
        if(booking.Delegates !=  undefined){
          delTotal = booking.Delegates.length
          for( del = 0 ; del <= delTotal-1; del++){
            delArr.push('<li>'+booking.Delegates[del].FirstName+ "  "+ booking.Delegates[del].Surname +'</li>')
          }
        }
        let courseArr = []
        $(".invDetails").remove()
        $(".delegateDetailsEdit").attr("data-specificid", selectedId)
        $("#matrixStart").val(booking.Start)
        $("#matrixEnd").val(booking.End)
        $("#matrixDays").val(booking.TotalDays)
        $("#matrixTimeScale").val(booking.TimeScale)
        $("#matrixLocation").val(booking.SiteLocation)
        $("#matrixSiteContact").val(booking.SiteContact)
        $("#matrixContactNumber").val(booking.ContactNumber)
        $("#matrixAwardingBody").val(booking.AwardingBody)
        if(item.Status == "Cancelled" || booking.TrainerStage[booking.TrainerStage.length-1].Stage == "Cancelled"){
          $("#matrixStatusSelect").val("Cancelled")
          $(".cancelBooking").hide()

        } else {
          $("#matrixStatusSelect").val(item.Status)
          $(".cancelBooking").show()
        }
        if(booking.AwardingBody == "NPORS"){
          $(".nporsNotificationData").show()
          $("#matrixNotificationType").val(booking.NPORSNotification)
        } else {
            $(".nporsNotificationData").hide()
          $("#matrixNotificationType").val('')
        }
        let clone = $(".trainerDetails").eq(0).clone()
        if(booking.TrainerArray != undefined){
          for(tr = 0; tr <= booking.TrainerArray.length - 1; tr++){
            let trainer = booking.TrainerArray[tr].Trainer
            let start = booking.TrainerArray[tr].Start
            let end = booking.TrainerArray[tr].End
                $(".matrixTrainer").eq(tr).val(trainer)
                $(".matrixTrainerStart").eq(tr).val(start)
                $(".matrixTrainerEnd").eq(tr).val(end)
          }
        } else {
          $(".matrixTrainer").val(booking.Trainer)
          $(".matrixTrainerStart").val(booking.Start)
          $(".matrixTrainerEnd").val(booking.End)
        }
        if($(".trainerDetails").length > 1){
          $(".removeLastTrainer").removeAttr('disabled')
        }
        addCourseMatrix(booking.AwardingBody)
        $("#matrixAwardingBody").trigger("change",[{Cards:booking.CardsIncluded}])
        $("#matrixCardSelect").val(booking.CardsIncluded)
        $("#matrixRate").val(booking.Rate)
        $("#matrixCardRate").val(booking.CardRate)
        $("#matrixRateType").val(booking.CandidateDayRate)
        $("#matrixTrainer").val(booking.Trainer)
        $("#stagePaperwork").val($(booking.Paperwork).last()[0].Stage).attr('data-originalStage',$(booking.Paperwork).last()[0].Stage)
        $("#stageRegister").val($(booking.Register).last()[0].Stage).attr('data-originalStage',$(booking.Register).last()[0].Stage)
        $("#stageCards").val($(booking.Cards).last()[0].Stage).attr('data-originalStage',$(booking.Cards).last()[0].Stage)
        $("#stageCertificates").val($(booking.Certs).last()[0].Stage).attr('data-originalStage',$(booking.Certs).last()[0].Stage)
        $("#stageInvNo").val($(booking.Invoice).last()[0].InvNo).attr('data-originalno',$(booking.Invoice).last()[0].InvNo)
        $("#stageInvDate").val($(booking.Invoice).last()[0].Date).attr('data-originaldate',$(booking.Invoice).last()[0].Date )


        if($(booking.Paid).last()[0].Stage == "N/A"){
          $("#matrixPaidCheck").hide()
        } else {
          if($(booking.Paid).last()[0].Stage == "Paid"){
            $("#matrixPaidCheck").prop("checked",true)
            $("#stagePaidDate").val($(booking.Paid).last()[0].Date).attr('data-originaldate',$(booking.Paid).last()[0].Date)
          }
        }
        cardSelected = booking.CardsIncluded
        if(booking.RefNumber != undefined){
          $("#matrixBatchNumber").val(booking.RefNumber)
        }
        if(booking.PostalTracking != undefined){
          $("#matrixTrackingNumber").val(booking.PostalTracking)
        }
        $("#matrixPONumber").val(booking.PONumber)
        for(ci = 0; ci <= booking.CourseInfo.length -1; ci++){
          totaldays = booking.CourseInfo[ci].TotalDays
          dayRate = booking.CourseInfo[ci].Rate
          bookedCourses.push('<tr class="courseRowsMatrix"><td></td><td><input type="text" list="matrixCourses" name="" class="form-control matrixCourseDesc"  value="'+booking.CourseInfo[ci].Course+'"><datalist id="matrixCourses"></datalist></td><td><select class="form-select courseTestingType" name=""> <option value="Novice">Novice</option> <option value="Refresher">Refresher</option> <option value="EWT">EWT</option> <option value="Conversion">Conversion</option> </select><td><input type="text" name="" value="'+booking.CourseInfo[ci].BookedDelegates+'" class="form-control matrixBookedDel"></td><td><i class="fa-solid fa-trash-can deleteCourseMatrix"></i></td></tr>')
          if(booking.CourseInfo[ci].TestingType == "NPORS Testing Type" || booking.CourseInfo[ci].TestingType == ""){
            courseArr.push('<li>'+booking.CourseInfo[ci].Course+'<li>')
            $(".testingType").hide()
          } else {
            courseArr.push('<li>'+booking.CourseInfo[ci].Course+' - '+booking.CourseInfo[ci].TestingType+'</li>')
          }

          addTestType(ci,booking.CourseInfo[ci].TestingType)
        }

        let poRef = ""
        if(booking.PONumber == "" || booking.PONumber == undefined || booking.PONumber == null){
          poRef = "Not Provided"
        } else {
          poRef = booking.PONumber
        }
        let rate = ""
        if(booking.TotalDays == "0.5"){
          rate = booking.Rate
        } else {
          rate = booking.Rate
        }
        let invoiceDetails = "<tr class='invDetails'><td class='trainingSpecs'>Training Booking: "+booking.AwardingBody  + courseArr.toString().replaceAll(",","") + '<li>Dates:'+new Date(booking.Start).toLocaleDateString('en-gb')+'-'+new Date(booking.End).toLocaleDateString('en-gb')+'</li><li>Duration: '+booking.TotalDays+'day(s)</li>'+'<li>Location: '+booking.SiteLocation+'</li>'+'<li> PO Number: '+poRef+'</li></td><td>'+booking.TotalDays+'</td><td>'+rate+'</td></tr><tr class="invDetails"><td class="cardsBooked">'+booking.CardsIncluded+' accreditation for:'+ delArr.toString().replaceAll(",","")+'</td><td>'+delTotal+'</td><td>'+booking.CardRate+'</td></tr>'
        $(".invoiceScroll").children("table").append(invoiceDetails)
        $(".courseInner").append(bookedCourses.toString().replaceAll(",",""))
          $('.OverlayOne').addClass("Open")
          if(booking.ChangeLog != undefined){
            for(cl = 0; cl <= booking.ChangeLog.length -1; cl++){
              let baseLog = booking.ChangeLog[cl]
              let eachUpdate = []
              for(ci = 0; ci <= baseLog.length -1 ; ci++){
                eachUpdate.push('<tr><td>' + baseLog[ci].FieldChanged + '</td><td>' + baseLog[ci].Modified + '</td><tr>')
              }
              $(".changeLogList").append('<tr class="changeLogItem"><td>'+baseLog[0].ModifiedDate+'</td><td>'+baseLog[0].User+ '</td><td>'+baseLog.length+' item(s) modified<table><tr><td>Field Modified</td><td>Modification</td></tr>'+eachUpdate.toString().replaceAll(",","")+'</table></td></tr>')
            }
          }

      }
    }
  })



}



function addTestType (location, testingType){
  setTimeout(function(){
    $(".courseTestingType").eq(location).val(testingType);
  },0)
}


$(document).on("click", ".moreInfo", function(){
  $(this).closest(".delegateDetailsMatrix").animate({'height': '15rem'})
  $(this).closest(".delegateDetailsMatrix").find(".hidden").slideDown()
  $(this).addClass("lessInfo").removeClass("moreInfo")
  $(this).children(".fa-plus").addClass("fa-minus").removeClass("fa-plus")
  $(this).children('span').text($(this).children('span').text().replace("More Information","Less Information"))
})


$(document).on("click",'.editInfo, .cancelEdit, .newCandidate' ,function(){
  let item = this
  if($('.OverlayTwo').hasClass("Open")){
    $(".OverlayTwo").animate({'left': '-100%'})
    $('.OverlayTwo').removeClass("Open")
    $(".delegateImgTwo").css({'background-image': "url('/Images/vortalPortraitStandIn.png')"})
    $("#delegatePhotoChange")[0].reset()
    $("#changePhoto").val(null)
    $(".delegateDetailsEdit").removeAttr("data-userid")
  } else {
    $('.OverlayTwo').addClass("Open")
    $(".OverlayTwo").animate({'left': '0'})
    $(".delegateDetailsEdit").attr("data-userid", $(this).closest(".delegateDetailsMatrix").attr("data-userid"))
    delegateDetailsFill($(this).closest(".delegateDetailsMatrix").attr("data-userid"))
  }
})


function delegateDetailsFill(selected){
$("#delegatePhotoChange").trigger('reset')
  $(".courseDetailsRow").remove()
  if(selected != undefined){
  var assignedCourses = []
  // just
  $.post("/matrixRetrieve", {
    idOne:$(".matrixBody").attr('data-headerid')
  }).done(function(data){
    for(i =0; i <= data.Bookings.length -1; i++){
      let booking = data.Bookings[i]
      let courseArr = []
      let trainer = booking.Trainer
      for(ci = 0; ci <= booking.CourseInfo.length -1; ci++){
        courseArr.push('<option value="'+booking.CourseInfo[ci].Course+'">'+booking.CourseInfo[ci].Course+'</option>')
      }
      if(booking._id == $(".delegateDetailsEdit").attr("data-specificid")){
        for(b=0; b<= booking.Delegates.length-1; b++){
          let delegate = booking.Delegates[b]
          if(delegate.UserId == selected){
            let location = ""
            if(delegate.ImageLocation == undefined){
              location = '/Images/vortalPortraitStandIn.png'
            } else {
              location = delegate.ImageLocation
            }
            $(".delegateImgTwo").css('background-image', 'url(' + location + ')').attr('data-imgkey',delegate.ImageKey);
            $("#editModeFirstName").val(delegate.FirstName)
            $("#editModeSurname").val(delegate.Surname)
            $("#editModeDOB").val(delegate.DateOfBirth)
            $("#editModeMobileNumber").val(delegate.MobileNumber)
            $("#editModeEmailAddress").val(delegate.EmailAddress)
            $("#editModeCompany").val(delegate.Company)
            $("#editModeIdCheck").val(delegate.IdCheckType)
            $("#editModeLastDigits").val(delegate.idCheckDigits)
            let courseList = []

            if(delegate.Course[0] != undefined){
              for(dc = 0; dc <= delegate.Course[0].length -1; dc++){
                let delegateCourse = delegate.Course[0][dc]
                let reason = ""
                let passFail = ""
                if(this.PassFail == "Fail"){
                  passFail = '<select value="'+delegateCourse.PassFail+'" class="form-control editModeInput detailsPassFail"><option value="Pass">Pass</option><option value="Fail" selected>Fail</option></select>'
                } else {
                  passFail = '<select value="'+delegateCourse.PassFail+'" class="form-control editModeInput detailsPassFail"><option value="Pass" selected>Pass</option><option value="Fail">Fail</option></select>'
                }
                if(this.FailReason != undefined){
                  reason =' <input class="form-control editModeInput detailsFailReason" type="text" name="" value="'+delegateCourse.FailReason+'">'
                } else {
                  reason = '<input class="form-control editModeInput detailsFailReason" type="text" name="" value="N/A">'
                }
                  assignedCourses.push(delegateCourse.Course)
                  courseList.push('<tr class="courseDetailsRow"><td><select value="" class="form-control editModeInput detailsCourse">'+courseArr.toString().replaceAll(",","")+'</select></td><td><input type="date" name="" value="'+delegateCourse.Date+'" class="form-control editModeInput detailsDate"></td><td><input class="form-control editModeInput detailsTrainer" type="text" name="" value="'+delegateCourse.Trainer+'"></td><td>'+passFail+'</td><td>'+reason+'</td><td><span class="removeEditRow">Remove<span></td></tr>')

              }
              $(".courseInfoEditMode").append(courseList.toString().replaceAll(",",""))
            }
          }
        }
      }
    }
    $.each(assignedCourses, function(t){
      $(".courseDetailsRow").eq(t).find('.detailsCourse').val(this.toString())
    })
  })

  }
}

$(document).on({mouseenter: function(){
$(this).find(".editCandidatePhoto").show(250)
$(this).find(".delegateImgTwo").animate({'opacity': '0.5'}, 250)
},
mouseleave: function(){
$(this).find(".editCandidatePhoto").hide(250)
$(this).find(".delegateImgTwo").animate({'opacity': '1'},250)
}
}, ".imgPlaceHolderTwo")

$(document).on({mouseenter: function(){
$(this).find(".editPhoto").show(250)
$(this).find(".candidateImgTwo").animate({'opacity': '0.5'}, 250)
},
mouseleave: function(){
$(this).find(".editPhoto").hide(250)
$(this).find(".candidateImgTwo").animate({'opacity': '1'},250)
}
}, ".imgPlaceHolderTwo")


$(document).on("click", ".editPhoto", function(){
  $(this).closest(".OverlayTwo").find("#changePhoto").trigger('click')
})

$(document).on("change","#changePhoto", function(){
  if($(this)[0].files.length > 0){
    let createUrl = URL.createObjectURL(this.files[0])
    $(this).closest(".OverlayTwo").find(".delegateImgTwo").css('background-image', 'url(' + createUrl + ')')
  }
})

$(document).on("click",".submitEdit",function(){
  $("#delegatePhotoChange").submit()
})

$(document).on("submit","#delegatePhotoChange", function(event){
  event.preventDefault();
  let courseArray = []
  $(this).closest(".OverlayTwo").find(".courseDetailsRow").each(function(){
    courseArray.push({
      Course: $(this).find(".detailsCourse").val(),
      Trainer: $(this).find(".detailsTrainer").val(),
      PassFail: $(this).find(".detailsPassFail").val(),
      FailReason: $(this).find(".detailsFailReason").val(),
      Date: $(this).find('.detailsDate').val()
    })
  })

  let firstName = $("#editModeFirstName").val()
  let surname = $("#editModeSurname").val()
  let userId = ""
  let dob = $("#editModeDOB").val()
  let company = $("#editModeCompany").val()
  let mobileNumber = $("#editModeMobileNumber").val()
  let emailAddress = $("#editModeEmailAddress").val()
  let idCheck = $("#editModeIdCheck").val()
  let idDigits = $("#editModeLastDigits").val()
  let photoKey = $(".delegateImgTwo").attr('data-imgkey')
  if($(".delegateDetailsEdit").attr("data-userid") != undefined){
    userId = $(".delegateDetailsEdit").attr("data-userid")
  } else {
    userId = firstName.charAt(0).toUpperCase() + surname.charAt(0).toUpperCase() + Math.floor(Math.random() * 20) + $(".vortexRefMatrix").text().replaceAll("-","")
  }
  var data = new FormData($(this)[0]);
  data.append('UpdateCourseId', $(".matrixBody").attr("data-headerid"))
  data.append('SpecificId', $('.delegateDetailsEdit').attr("data-specificid"))
  data.append('UserId', userId)
  data.append('firstName', firstName)
  data.append('surname', surname)
  data.append('dateOfBirth', dob)
  data.append('company', company)
  data.append('mobileNo', mobileNumber)
  data.append('emailAddress', emailAddress)
  data.append('docName',photoKey )
  data.append('idCheck',idCheck)
  data.append('idDigits', idDigits)
  data.append('CourseOverall',JSON.stringify(courseArray))
  $.ajax({
             url:'/delegatesUpdateWithImage',
             type: 'POST',
             contentType: false,
             processData: false,
             cache: false,
             data: data,
             error: function(){
                 alert('Error: Document could not be uploaded, please try again');
             },
             complete: function(){
               delegateUpdate("Updated")
               detailsUpdate($(".matrixBody").attr('data-headerid'),$(".clickedBooking"))
               setTimeout(function(){
                 $(".OverlayTwo").animate({'left': '-100%'})
                 $('.OverlayTwo').removeClass("Open")
                $(".delegateForm").trigger('reset')
                $(".delegateImgTwo").css({'background-image': "url('/Images/vortalPortraitStandIn.png')"})
                $(".delegateDetailsEdit").removeAttr("data-userid")
               },100)
             }

         })
})

$(document).on("click", ".addCourseRow", function(){
  newCoureRow()
})

function newCoureRow(){
  let courseList = []
  $.post("/matrixRetrieve", {
    idOne:$(".matrixBody").attr('data-headerid')
  }).done(function(data){
    for(i = 0; i <= data.Bookings.length -1; i++){
      if(data.Bookings[i]._id == $(".clickedBooking").attr('data-specificid')){
        let startDate = data.Bookings[i].Start
        let courseArr = []
        let trainerArr = []
        for(c = 0 ; c <= data.Bookings[i].CourseInfo.length -1; c++){
          courseArr.push('<option value="'+data.Bookings[i].CourseInfo[c].Course+'">'+data.Bookings[i].CourseInfo[c].Course+'</option>')
        }
        if(data.Bookings[i].TrainerArray != undefined){
          for(t = 0; t <= data.Bookings[i].TrainerArray.length -1; t++ ){
            trainerArr.push('<option value="'+data.Bookings[i].TrainerArray[t].Trainer+'">'+data.Bookings[i].TrainerArray[t].Trainer+'</option>')
          }
        } else {
          trainerArr.push('<option value="'+data.Bookings[i].Trainer+'">'+data.Bookings[i].Trainer+'</option>')
        }
        courseList.push('<tr class="courseDetailsRow"><td><select value="" class="form-control editModeInput detailsCourse">'+courseArr.toString().replaceAll(",","")+'</select></td><td><input type="date" name="" value="'+startDate+'" class="form-control editModeInput detailsDate"></td><td><select class="form-select editModeInput detailsTrainer">'+trainerArr.toString().replaceAll(",","")+'</select></td><td><select value=" " class="form-control editModeInput detailsPassFail"><option>Select One</option><option value="Pass">Pass</option><option value="Fail">Fail</option></select></td><td><input class="form-control editModeInput detailsFailReason" type="text" name="" placeholder="Enter Reason Here"></td><td><span class="removeEditRow">Remove<span></td></tr>')

      }
    }
    $(".courseInfoEditMode").append(courseList.toString().replaceAll(",",""))
  })



}

$(document).on("click", ".removeEditRow", function(){
  $(this).closest(".courseDetailsRow").remove()
})

$(document).on("click", ".saveBookingDetails", function(){
  $(".OverlayOne").removeClass("modified")
  $(".OverlayOne").animate({'right': '-70%'})
  $('.OverlayOne').removeClass("Open")
coursesList = []
let paperworkStage = ""
let registerStage = ""
let cardStage = ""
let certificateStage = ""
let invoiceNo = ""
let invoiceDate =""
let paidStage = ""
if($("#stageInvNo").val() != $("#stageInvNo").attr('data-originalno') ||$("#stageInvNo").val() != "" ){
  invoiceNo = $("#stageInvNo").val()
  invoiceDate =$("#stageInvDate").val()
}
if($("#stagePaperwork").val() != $("#stagePaperwork").attr('data-originalstage')){
  paperworkStage = $("#stagePaperwork").val()
}
if($("#stageRegister").val() != $("#stageRegister").attr('data-originalstage')){
  registerStage = $("#stageRegister").val()
}
if($("#stageCards").val() != $("#stageCards").attr('data-originalstage')){
  cardStage = $("#stageCards").val()
}
if($("#stageCertificates").val() != $("#stageCertificates").attr('data-originalstage')){
  certificateStage = $("#stageCertificates").val()
}
  if($("#stagePaidDate").val() != $("#stagePaidDate").attr('data-originaldate')){
    paidStage = $("#stagePaidDate").val()
  }
let trainerArray = []
$(".courseRowsMatrix").each(function(){
  coursesList.push({
    Course: $(this).find(".matrixCourseDesc").val(),
    BookedDelegates: $(this).find(".matrixBookedDel").val(),
    TestingType: $(this).find(".courseTestingType").val()
  })
})
$(".trainerDetails").each(function(){
  trainerArray.push({
    Trainer: $(this).find(".matrixTrainer").val(),
    Start: $(this).find(".matrixTrainerStart").val(),
    End: $(this).find(".matrixTrainerEnd").val()
  })
})
$.post("/matrixBookingUpdate",{
  SelectedId: $(".matrixBody").attr("data-headerid"),
  SpecificId: $(".clickedBooking").attr("data-specificid"),
  Organisation: $("#orgNameMatrix").val(),
  BookerName: $("#bookerNameMatrix").val(),
  BookerEmail:$("#bookerEmailMatrix").val(),
  Start: $("#matrixStart").val(),
  End: $("#matrixEnd").val(),
  El: $("#matrixStart").val().toString().replaceAll("-0","").replaceAll("-",""),
  TimeScale: $("#matrixTimeScale").val(),
  TrainerArray: trainerArray,
  Total: $("#matrixDays").val(),
  Location: $("#matrixLocation").val(),
  SiteContact: $("#matrixSiteContact").val(),
  ContactNumber: $("#matrixContactNumber").val(),
  BatchRefNumber: $("#matrixBatchNumber").val(),
  PostTracking: $("#matrixTrackingNumber").val(),
  PONumber:$("#matrixPONumber").val(),
  AwardingBody: $("#matrixAwardingBody").val(),
  SelectedCard: $("#matrixCardSelect").val(),
  RateType:$("#matrixRateType").val(),
  Rate: $("#matrixRate").val(),
  CardRate: $("#matrixCardRate").val(),
  Courses: coursesList,
  PaperworkStage: paperworkStage,
  RegisterStage: registerStage,
  CardStage: cardStage,
  CertStage: certificateStage,
  InvNo: invoiceNo,
  InvDate: invoiceDate,
  PaidStage: paidStage,
  Notification: $("#matrixNotificationType").val(),
  User:$(".currentLoggedOn").attr('data-userfn'),
  Status: $("#matrixStatusSelect").val()

}).done(function(){
specificMissingItem($(".matrixBody").attr("data-headerid"),$(".clickedBooking").attr("data-specificid"))
delegateUpdate("Booking")
addOneMonth(+0)
})
})


function notesUpdates(selectedid){
$(".noteBorder").remove()
$('#note').val('')
$("#noteSeverity").val('Standard')
$.post("/matrixRetrieve", {
  idOne:selectedid
}).done(function(foundItem){
  for(n = 0; n <= foundItem.Notes.length-1; n++){
    let foundNote = foundItem.Notes[n]
    if(foundNote.Severity == "Important"){
      if(foundNote.CreatedBy == $(".currentLoggedOn").attr('data-userfn')){
        $(".notesImportant").prepend('<div class="noteBorder"><div class="fillerNote"></div><div class="noteBubbleMe"><i class="fa-solid fa-triangle-exclamation importantNote"></i>  '+foundNote.Note+'</div><div class="createdDetailsMe">'+foundNote.CreatedAt+" - "+foundNote.CreatedBy+'</div></div>')
      } else {
        $(".notesImportant").prepend('<div class="noteBorder"><div class="noteBubbleOther"><i class="fa-solid fa-triangle-exclamation importantNote"></i>  '+foundNote.Note+'</div><div class="createdDetailsOther">'+foundNote.CreatedAt+" - "+foundNote.CreatedBy+'</div><div class="fillerNote"></div></div>')
      }
    } else {
      if(foundNote.CreatedBy == $(".currentLoggedOn").attr('data-userfn')){
        $(".notesNormal").prepend('<div class="noteBorder"><div class="fillerNote"></div><div class="noteBubbleMe">'+foundNote.Note+'</div><div class="createdDetailsMe">'+foundNote.CreatedAt+" - "+foundNote.CreatedBy+'</div></div>')
      } else {
        $(".notesNormal").prepend('<div class="noteBorder"><div class="noteBubbleOther">'+foundNote.Note+'</div><div class="createdDetailsOther">'+foundNote.CreatedAt+" - "+foundNote.CreatedBy+'</div><div class="fillerNote"></div></div>')
      }
    }

  }
})
}

function delegateLoad(){
  $(".candidateItem").remove()
  $.ajax({
             url:'/articles',
             complete: function(results){
      let data = results.responseJSON
      for(i = 0; i <= data.length -1 ; i++){
        let start = data[i]
        let vortexRef = start.VortexRef
        let headerId = start._id
        for(b = 0; b <= start.Bookings.length -1; b++){
          let booking = start.Bookings[b]
          let bookingRef = vortexRef+ "/" + alaphabetArray[b]
          let specificId = booking._id
          if(booking.Delegates != undefined){
            for(d = 0; d <= booking.Delegates.length-1; d++){
              let delegate = booking.Delegates[d]
              let imageUrl = ""
              let courseArr = []
              if(delegate.ImageLocation == undefined){
                imageUrl = '/Images/vortalPortraitStandIn.png'
              } else {
                imageUrl = delegate.ImageLocation
              }
              if(delegate.Course != undefined){
                if(delegate.Course[0].length > 0){
                  for(dc = 0; dc <= delegate.Course[0].length -1; dc++){
                    courseArr.push('<div>'+delegate.Course[0][dc].Course+' - '+delegate.Course[0][dc].PassFail+'</div>')

                  }
                } else {
                  courseArr.push('<div>No Course(s) Assigned</div>')
                }
              } else {
                courseArr.push('<div>No Course(s) Assigned</div>')
              }
              $('.delegatesList').append('<tr class="candidateItem" data-headerid="'+headerId+'" data-specificid="'+specificId+'" data-userid="'+delegate.UserId+'"><td><div class="candidatePhoto" style="background-image:url('+imageUrl+')"></div></td><td class="delegateFullName">'+delegate.FirstName+ ' '+ delegate.Surname + '</td><td>'+bookingRef+'</td><td>'+courseArr.toString().replaceAll(",","")+'</td><td><div class="candidateMoreInfo"><i class="fa-solid fa-plus"></i>More Information</div><div class="goToBooking"><i class="fas fa-directions"></i>Go to Booking</div></td></tr>')
            }
          }

        }
      }
  }
  })
}

$(document).on("click",".clearCandidateSearch", function(){
  $(".candidateSearchBar").val("")
  $(".candidateItem").show()
})

$(document).on("click",".candidateMoreInfo", function(){
  $(".candidateCourseInfo").remove()
  $(".overLayCandidate").animate({'right': '0'})
  $('.overLayCandidate').addClass("Open")
  let headerid = $(this).closest(".candidateItem").attr('data-headerid')
  let specificid = $(this).closest(".candidateItem").attr('data-specificid')
  let userId = $(this).closest(".candidateItem").attr('data-userid')
  $.post("/matrixRetrieve", {
    idOne:headerid
  }).done(function(data){
    for(i = 0; i <= data.Bookings.length -1; i++){
      let booking = data.Bookings[i]
      if(booking._id == specificid){
        for(d = 0; d <= booking.Delegates.length -1; d++){
          let delegate = booking.Delegates[d]
          if(delegate.UserId == userId){
            let candImage = ""
            if(delegate.ImageLocation == undefined){
              candImage = '/Images/vortalPortraitStandIn.png'
            } else {
              candImage = delegate.ImageLocation
            }
            if(delegate.Course == undefined || Number(delegate.Course[0].length) == 0){
              $(".courseInfoCandidate").append('<tr class="candidateCourseInfo"><td colspan="6"> No Course(s) have been added</td></tr>')
            } else {
              for(dc = 0; dc <= delegate.Course[0].length -1; dc++){
                let courses = delegate.Course[0][dc]
                let reason = ""
                if(courses.FailReason == "" || courses.FailReason == undefined){
                  reason = "N/A"
                } else {
                  reason = courses.FailReason
                }
                $(".courseInfoCandidate").append('<tr class="candidateCourseInfo"><td>'+courses.Course+'</td><td>'+new Date(courses.Date).toLocaleDateString('EN-GB')+'</td><td>'+courses.Trainer+'</td><td>'+courses.PassFail+'</td><td>'+reason+'</td></tr>')

              }
            }
            $(".candidateImgTwo").css('background-image', 'url(' + candImage + ')').attr('data-imgkey',delegate.ImageKey);
            $("#candidateFirstName").val(delegate.FirstName)
            $("#candidateSurname").val(delegate.Surname)
            $("#candidateDOB").val(delegate.DateOfBirth)
            $("#candidateMobileNumber").val(delegate.MobileNumber)
            $("#candidateEmailAddress").val(delegate.EmailAddress)
            $("#candidateCompany").val(delegate.Company)
            $("#candidateIdCheck").val(delegate.IdCheckType)
            $("#candidateLastDigits").val(delegate.idCheckDigits)
          }
        }
        $.each(this.Delegates, function(){

        })
      }
    }
  })
})

$(document).on("input", ".candidateSearchBar", function(){
  let currentVal = $(this).val().toLowerCase()
  if($(this).val() == ""){
    $(".candidateItem").show()
  } else {
    $(".candidateItem").each(function(){
      if($(this).find(".delegateFullName").text().toLowerCase().search(currentVal) < 0){
        $(this).hide()
      }
    })
  }
})

$(document).on("input",".orgSearch", function(){
  let currentVal = $(this).val().toLowerCase()
  if(currentVal == ""){
    $('.orgItem').show()
  } else {
    $(".orgItem").each(function(){
      if($(this).find(".orgName").text().toLowerCase().search(currentVal) < 0){
        $(this).hide()
      }
    })
  }
})

$(document).on("input",".courseSearch", function(){
  let currentVal = $(this).val().toLowerCase()
  if(currentVal == ""){
    $('.courseItem').show()
  } else {
    $(".courseItem").each(function(){
      if($(this).find(".courseName").text().toLowerCase().search(currentVal) < 0){
        $(this).hide()
      }
    })
  }
})

$(".closeCandidate").on("click", function(){
  $(".candidateImgTwo").css('background-image', 'url("")').removeAttr('data-imgkey',this.ImageKey)
  $(".overLayCandidate").animate({'right': '-70%'})
  $('.overLayCandidate').removeClass("Open")
  $("#candidateFirstName").val("")
  $("#candidateSurname").val("")
  $("#candidateDOB").val("")
  $("#candidateMobileNumber").val("")
  $("#candidateEmailAddress").val("")
  $("#candidateCompany").val("")
  $("#candidateIdCheck").val("")
  $("#candidateLastDigits").val("")
})

function orgLoad() {
  $(".orgItem").remove()
  $.get("/companyData", function(data){
    for(i = 0; i <= data.length -1 ; i++){
      let item = data[i]
      let imageUrl = ""
      if(item.ImageLocation == undefined || item.ImageLocation == ""){
        imageUrl = '/Images/VortalOrgStandIn.png'
      } else {
        imageUrl = item.ImageLocation
      }
      $(".orgMatrixList").append('<tr class="orgItem" data-orgid="'+item._id+'"><td><div class="orgPlaceHolder" style="background-image:url('+imageUrl+')"></div></td><td class="orgName">'+item.CompanyName+'</td></tr>')

    }
  })
}


$(document).on("click",".orgItem", function(){
  $('.newOrg').addClass("saveOrg").removeClass("newOrg")
  let item = this
  if($('.orgOverlay').hasClass("Open")){
    $(".orgOverlay").animate({'right': '-70%'}).delay(200).animate({'right': '0'})
    $('.orgOverlay').addClass("Open")
    setTimeout(function(){orgDetails(item)}, 400)
  } else {
    $(".orgOverlay").animate({'right': '0'})
    $('.orgOverlay').addClass("Open")
    orgDetails(item)
  }

})

function orgDetails(selected){
  let item = ""
  if($(selected).hasClass("orgItem")){
    $(".orgOverlay").attr("data-orgid",$(selected).attr("data-orgid"))
    item = $(selected).attr('data-orgid')
  } else {
    $(".orgOverlay").attr("data-orgid",selected)
    item = selected
  }

$(".userItemOrg").remove()
$(".awardingBodiesPref").children().remove()
$(".orgAwardingBodies").children().remove()

  $.get('/courses', function(courses){
    $.each(courses, function(){
        let awardingBodies = []
      let accredTypes = []
      $.each(this.AccreditationTypes, function(){
        accredTypes.push('<option value="'+this.Description+'">'+this.Description+'</option>')
      })
      awardingBodies.push('<td>'+this.AwardingBody+'</td>')
      $(".awardingBodiesPref").append('<td><select class="form-control AccredPref" id="pref'+this.AwardingBody+'"><option value="Not Set">Not Set</option>'+accredTypes.toString().replaceAll(",","")+'</select></td>')
      $(".orgAwardingBodies").append(awardingBodies.toString().replaceAll(",",""))
    })
  })
    $(".orgCheckBox").prop('checked', false).val(false)
  $.get("/companyData", function(data){
    $.each(data, function(){
      if(this._id == item){
        let imageUrl = ""
        if(this.ImageLocation == undefined || this.ImageLocation == ""){
          imageUrl = '/Images/VortalOrgStandIn.png'
        } else {
          imageUrl = this.ImageLocation
        }
        $("#orgStatus").val(this.OrgStatus)
        $(".orgHeader").val(this.CompanyName)
        $(".orgImage").css({'background-image': 'url('+imageUrl+')'})
        $("#orgEditPostal").val(this.PostalAddress)
        $("#orgEditBilling").val(this.BillingAddress)
        $("#orgNumber").val(this.OfficeNumber)
        if(this.MarketingPref[0].Email == true){
          $("#orgMarketingEmail").prop('checked', true).val(true)
        }
        if(this.MarketingPref[0].Calls == true){
          $("#orgMarketingCalls").prop('checked', true).val(true)
        }
        if(this.MarketingPref[0].Text == true){
          $("#orgMarketingText").prop('checked', true).val(true)
        }
        if(this.CertsWithoutPayment == true){
          $("#orgAccredWPay").prop('checked',true).val(true)
        }
          $.each(this.AccreditationPref, function(){
            let pref = "#pref" + this.AwardingBody
            $(pref).val(this.Preferred)
          })
        $.each(this.User, function(){
          let checked = ""
          if(this.MainEmployee == true){
            checked = "checked"
          }
          let access = ""
          if(this.AccessToVortal == true){
            access = "checked"
          }
          $(".userDetailsList").append('<tr class="userItemOrg"><td contenteditable="true" class="fullNameOrg">'+this.FullName+'</td><td contenteditable="true" class="emailOrg" data-originalemail="'+this.EmailAddress+'">'+this.EmailAddress+'</td><td contenteditable="true" class="numberOrg">'+this.MobileNumber+'</td><td><input class="form-check-input orgCheckBox mainContactOrg" type="checkbox" value="'+this.MainEmployee+'" '+checked+'></td><td><input class="form-check-input orgCheckBox accessVortalOrg" type="checkbox"  value="'+this.AccessToVortal+'" '+access+'></td><td>'+this.VortalSite+'</td></tr>')
        })
      }
    })
  })
}


$(document).on("change", ".orgCheckBox", function(){
  if($(this).prop('checked') == true ){
    $(this).val(true)
  } else {
    $(this).val(false)
  }
})

$(".cancelOrg").on("click", function(){
  $(".orgOverlay").animate({'right': '-70%'})
  $('.orgOverlay').removeClass("Open")
})

$(document).on("input",".userItemOrg", function(){
  if(!$(this).hasClass("New")){
    $(this).addClass("Updated")
  }
})


$(document).on("click",'.saveOrg', function(){
  let accredPref = []
  if($(".orgOverlay").find(".tempUserPassword").val() != undefined && $(".orgOverlay").find(".tempUserPassword").val() == ""){
      alert("Please enter temporary passwords for the user")
  } else {
    $(".awardingBodiesPref").children("td").each(function(){
      let id = $(this).find(".AccredPref").attr('id')
      accredPref.push({
        AwardingBody: id.substring(4),
        Preferred: $(this).find(".AccredPref").val()
      })
    })

    $(".userItemOrg").each(function(){
      if($(this).hasClass("Updated")){
        $.post("/userUpdate", {
          SelectedId: $(".orgOverlay").attr('data-orgid'),
          OriginalEmail: $(this).find(".emailOrg").attr('data-originalemail'),
          FullName: $(this).find(".fullNameOrg").text(),
          EmailAddress: $(this).find(".emailOrg").text(),
          ContactNumber: $(this).find(".numberOrg").text(),
          MainContact: $(this).find(".mainContactOrg").val(),
          Access: $(this).find('.accessVortalOrg').val()
        })
      }
      if($(this).hasClass("New")){
        $.post("/newUser",{
          SelectedId: $(".orgOverlay").attr('data-orgid'),
          FullName: $(this).find(".fullNameOrg").text(),
          EmailAddress: $(this).find(".emailOrg").text(),
          ContactNumber: $(this).find(".numberOrg").text(),
          MainContact: $(this).find(".mainContactOrg").val(),
          Access: $(this).find('.accessVortalOrg').val()
        })
      }
    })

    $.post("/orgUpdate", {
      SelectedId: $(".orgOverlay").attr('data-orgid'),
      CompanyName:$(".orgHeader").val(),
      Status: $('#orgStatus').val(),
      Postal: $("#orgEditPostal").val(),
      Billing: $("#orgEditBilling").val(),
      ContactNumber: $("#orgNumber").val(),
      MarketEmail: $("#orgMarketingEmail").val(),
      MarketText: $("#orgMarketingText").val(),
      MarketCall: $("#orgMarketingCalls").val(),
      Accreditations: $("#orgAccredWPay").val(),
      Preferences: accredPref
    }).done(function(){
      delegateUpdate("OrgUpdate")
    })
  }

})

$(document).on("click", ".newOrg", function(){
  let accredPref = []
  if($(".orgOverlay").find(".tempUserPassword").val() != undefined && $(".orgOverlay").find(".tempUserPassword").val() == ""){
      alert("Please enter temporary passwords for the user")
  } else {
    $(".awardingBodiesPref").children("td").each(function(){
      let id = $(this).find(".AccredPref").attr('id')
      accredPref.push({
        AwardingBody: id.substring(4),
        Preferred: $(this).find(".AccredPref").val()
      })
    })
    $.post("/newOrgAdded", {
      SelectedId: $(".orgOverlay").attr('data-orgid'),
      CompanyName:$(".orgHeader").val(),
      Status: $('#orgStatus').val(),
      Postal: $("#orgEditPostal").val(),
      Billing: $("#orgEditBilling").val(),
      ContactNumber: $("#orgNumber").val(),
      MarketEmail: $("#orgMarketingEmail").val(),
      MarketText: $("#orgMarketingText").val(),
      MarketCall: $("#orgMarketingCalls").val(),
      Accreditations: $("#orgAccredWPay").val(),
      Preferences: accredPref
    }).done(function(result){
      $(".orgOverlay").attr('data-orgid', result)
      orgDetails(result)
      delegateUpdate("OrgAdded")
    })
  }
})

$(document).on('click',".newUser" ,function(){
  $(".userDetailsList").append('<tr class="userItemOrg New"><td contenteditable="true" class="fullNameOrg"></td><td contenteditable="true" class="emailOrg"></td><td contenteditable="true" class="numberOrg"></td><td><input class="form-check-input orgCheckBox mainContactOrg" type="checkbox" value=""></td><td><input class="form-check-input orgCheckBox accessVortalOrg" type="checkbox"  value=""></td><td><input type="text" name="" value="" placeholder="Temp Password" class="tempUserPassword form-control"><button type="button" name="button" class="btn btn-danger removeUserLine"><i class="fas fa-minus"></i>  New Employee</button></td></tr>')

})

$(document).on("click",".removeUserLine", function(){
  $(this).closest('.userItemOrg').remove()
})

$(document).on("click", ".addNewOrgs", function(){
  $(".orgAwardingBodies").children().remove()
  $(".awardingBodiesPref").children().remove()
  $.get('/courses', function(courses){
    $.each(courses, function(){
        let awardingBodies = []
      let accredTypes = []
      $.each(this.AccreditationTypes, function(){
        accredTypes.push('<option value="'+this.Description+'">'+this.Description+'</option>')
      })
      awardingBodies.push('<td>'+this.AwardingBody+'</td>')
      $(".awardingBodiesPref").append('<td><select class="form-control AccredPref" id="pref'+this.AwardingBody+'"><option value="Not Set">Not Set</option>'+accredTypes.toString().replaceAll(",","")+'</select></td>')
      $(".orgAwardingBodies").append(awardingBodies.toString().replaceAll(",",""))
    })
  })
  $('.saveOrg').addClass("newOrg").removeClass("saveOrg")
  $('.orgOverlay').attr('data-orgid','')
  $('.userItemOrg').remove()
  $(".orgOverlay").animate({'right': '0'})
  $('.orgOverlay').addClass("Open")
  $('.orgOverlay').find('input').val('')
  $('.orgOverlay').find(".orgCheckBox").prop('checked',false).val(false)
  $('.orgOverlay').find('select').prop('selectedIndex',0)
  $(".newUser").hide()
  $('.orgUserDetails').hide()
  $(".employeeHeader").hide()

})


function courseLoad() {
  $(".awardingBodyList").remove()
  $(".awardingBodyItem").remove()
  $.get("/courses", function(data){
    $.each(data, function(){
      let awardingBody = this.AwardingBody
      let appendTo = '.list'+awardingBody
      let card = ""
      let cert = ""
      let paperwork =""
      if(this.Cards == "Yes"){
        card = '<i class="far fa-check-circle"></i>'
      } else {
        card = '<i class="far fa-times-circle"></i>'
      }
      if(this.Certs == "Yes"){
        cert = '<i class="far fa-check-circle"></i>'
      } else {
        cert = '<i class="far fa-times-circle"></i>'
      }
      if(this.Paperwork == "Yes"){
        paperwork = '<i class="far fa-check-circle"></i>'
      } else {
        paperwork = '<i class="far fa-times-circle"></i>'
      }
      let acType = []
      $.each(this.AccreditationTypes, function(){
        acType.push('<li>'+this.Description+'</li>')
      })
      $(".selectOneAwardingBody").after('<option class="awardingBodyItem" value="'+awardingBody+'">'+awardingBody+'</option>')
      $(".courseDetailsList").append('<div class="awardingBodyList list'+this.AwardingBody+'"><div>'+this.AwardingBody+'</div><div class="acceptedIdea"><div>Cards '+card+'</div><div>Certs ' + cert +'</div><div> Paperwork ' +paperwork+'</div></div><div class="accTypes"> Accredidation Type(s) ' + acType.toString().replaceAll(",","")+'</div><div>')
      $.each(this.Courses, function(){
        $(appendTo).append('<div class="courseItem"><li class="courseName">'+this.Course+'</li><li>'+this.Description+'</li><li>Avg Duration: '+this.Duration+'</li><div>')
      })
    })
  })
}

$(document).on('click','.addCourseItem', function(){
  $(".courseOverlay").animate({'right': '0'})
  $('.courseOverlay').addClass("Open")
})


$(document).on('change',".awardingBodySelect", function(){
  $(".courseListItem").remove()
  $(".accredTyping").remove()
  $("#awardingBodyPaperwork").prop('checked',false).val("No")
  $("#awardingBodyCerts").prop('checked',false).val("No")
  $("#awardingBodyCards").prop('checked',false).val("No")
  if($(this).val() == "Other"){
    $(".awardingBodyInput").slideDown()
    $(".accredTypesCourses").append('<div class="accredTyping"><div class="col-sm-8"><input type="text" name="" value="" class="form-control" placeholder="Enter Type Here.. (e.g NPORS/CSCS)"></div><div class="removeAccredType"><i class="fa-solid fa-minus"></i> Remove</div></div>')
  } else {
    $(".awardingBodyInput").slideUp()
    $.get("/courses", function(data){
      $.each(data, function(){
        if(this.AwardingBody == $(".awardingBodySelect").val()){
          if(this.Cards == "Yes"){
            $("#awardingBodyCards").prop('checked',true).val("Yes")
          } else {
            $("#awardingBodyCards").prop('checked',false).val("No")
          }
          if(this.Certs == "Yes"){
            $("#awardingBodyCerts").prop('checked',true).val("Yes")
          } else {
            $("#awardingBodyCerts").prop('checked',false).val("No")
          }
          if(this.Paperwork == "Yes"){
            $("#awardingBodyPaperwork").prop('checked',true).val("Yes")
          } else {
            $("#awardingBodyPaperwork").prop('checked',false).val("No")
          }
          $.each(this.AccreditationTypes, function(){
            $(".accredTypesCourses").append('<div class="accredTyping"><div class="col-sm-8"><input type="text" name="" value="'+this.Description+'" class="form-control"></div><div class="removeAccredType"><i class="fa-solid fa-minus"></i> Remove</div></div>')
          })
          $.each(this.Courses, function(){
            $(".editCoursesList").append('<div class="courseListItem" data-oriinalcourse="'+this.Course+'"><h6>Course</h6><div class="courseName"><input type="text" name="" value="'+this.Course+'" class="form-control"></div><h6>Description</h6><div class="courseDesc"><input type="text" name="" value="'+this.Description+'" class="form-control"></div><h6>Avg Course Length</h6><div class="courseAverageDays"><div class="col-sm-4"><input type="number" name="" value="'+this.Duration+'" class="form-control"></div> </div></div>')
          })
        }
      })
    })
  }
})


$(document).on("click",'.addCourseDetails' ,function(){
  $(".editCoursesList").find(".coursesHeaderDesc").after('<div class="courseListItem Pending hidden"><h6>Course</h6><div class="courseName"><input type="text" name="" value="" class="form-control" placeholder="Course Name (inc any codes)"></div><h6>Description</h6><div class="courseDesc"><input type="text" name="" value="" class="form-control" placeholder="Description/Content"></div><h6>Avg Course Length</h6><div class="courseAverageDays"><div class="col-sm-4"><input type="number" name="" value="" class="form-control" placeholder="Average Days"></div> </div></div>')
  $(".courseListItem").each(function(){
    if($(this).hasClass('hidden') == true){
      $(this).slideDown()
    }
  })
})

$(document).on("change",".courseName, .courseAverageDays, .courseDesc",function(){
  if($(this).closest('.courseListItem').hasClass("Pending") ){
    if($(this).children('input').val() == ""){
      $(this).closest('.courseListItem').removeClass("New")
    } else {
      $(this).closest('.courseListItem').addClass("New")
    }

  } else {
    $(this).closest('.courseListItem').addClass("Updated")
  }
})

$(document).on("click", '.addAccred', function(){
  $(".accredTypesCourses").find('h6').after('<div class="accredTyping"><div class="col-sm-8"><input type="text" name="" value="" class="form-control"></div><div class="removeAccredType"><i class="fa-solid fa-minus"></i> Remove</div></div>')

})

$(document).on("click",".cancelCourseChange", function(){
  $(".courseOverlay").animate({'right': '-30%'})
  $('.courseOverlay').removeClass("Open")
  $(".awardingBodySelect").prop('selectedIndex',0)
  $(".courseListItem").remove()
  $(".accredTyping").remove()
  $("#awardingBodyPaperwork").prop('checked',false).val("No")
  $("#awardingBodyCerts").prop('checked',false).val("No")
  $("#awardingBodyCards").prop('checked',false).val("No")
})

$(document).on("click",".removeAccredType", function(){
  $(this).closest(".accredTyping").remove()
})

$(document).on("click",".accredCheckBox", function(){
  if($(this).prop('checked') == true){
    $(this).val("Yes")
  } else {
    $(this).val("No")
  }
})

$(document).on("click",".submitCourseChanges", function(){
  let accredType = []
  let newCourses = []

  $(".courseListItem").each(function(){
    if($(this).hasClass("New") == true){
      newCourses.push({
            Course: $(this).find(".courseName").children(".form-control").val(),
              Description: $(this).find(".courseDesc").children(".form-control").val(),
              Duration: $(this).find(".courseAverageDays").find(".form-control").val()
            })
    }
  })

  $(".accredTyping").each(function(){
    accredType.push({Description:$(this).find('.form-control').val()})
  })
  if($(".awardingBodySelect").val() == "Other"){
    $.post("/newAwardingBody", {
      AwardingBody: $(".awardingBodyInput").val(),
      Cards: $("#awardingBodyCards").val(),
      Certs: $("#awardingBodyCerts").val(),
      Paperwork: $("#awardingBodyPaperwork").val(),
      AccredTypes: accredType,
      Courses: newCourses
    }).done(function(){delegateUpdate("CourseUpdate")})
  } else {
    $.post("/courseUpdate", {
      AwardingBody: $(".awardingBodySelect").val(),
      Cards: $("#awardingBodyCards").val(),
      Certs: $("#awardingBodyCerts").val(),
      Paperwork: $("#awardingBodyPaperwork").val(),
      AccredTypes: accredType
    }).done(function(){
      $(".courseListItem").each(function(){
        switch (true) {
          case $(this).hasClass("Updated"): $.post("/individualCourseUpdate", {
            AwardingBody: $(".awardingBodySelect").val(),
            Original: $(this).attr("data-oriinalcourse"),
            Course: $(this).find(".courseName").children(".form-control").val(),
            Description: $(this).find(".courseDesc").children(".form-control").val(),
            Length: $(this).find(".courseAverageDays").find(".form-control").val()
          })

            break;
          case $(this).hasClass("New"):$.post("/additionalCourse", {
            AwardingBody: $(".awardingBodySelect").val(),
            Course: $(this).find(".courseName").children(".form-control").val(),
            Description: $(this).find(".courseDesc").children(".form-control").val(),
            Length: $(this).find(".courseAverageDays").find(".form-control").val()
          })

            break;

        }
      }).promise().done(function(){delegateUpdate("CourseUpdate")})
    })

  }
})

$(document).on("change", ".invoiceUpdates", function(){
  $(".saveInvoiceUpdates").removeClass("disabled")
})

$(document).on("click", ".saveInvoiceUpdates", function(){
  $.post("/invoiceUpdates", {
    User: $(".currentLoggedOn").attr("data-userfn"),
    StandardId: $(".matrixBody").attr("data-headerid"),
    SpecificId: $(".itemBooking").eq(0).attr("data-specificid"),
    InvoiceNumber: $("#matrixQuickInvoice").val(),
    InvoiceDate: $("#matrixQuickInvoiceDate").val(),
    PaidDate: $("#matrixQuickPaid").val()
  }).done(function(){
    delegateUpdate("Booking")
    fetchReq($(".matrixBody").attr("data-headerid"))
  })
})

$(".archiveBoxArea").click(function(){
  let location = $(this).offset()
  $(".matrixBody").prepend('<div class="archiveInput hidden"><input type="text" name="" value="" class="form-control matrixarchiveInput"><button type="button" name="button" class="archiveSave btn btn-success">Save</button><button type="button" name="button" class="archiveCancel btn btn-danger">X</button><div>')
  $(".archiveInput").css({top: location.top, left: location.left}).removeClass("hidden")
})

$(document).on("click",".archiveSave",function(){
  $.post("/newTask", {
    selectedId: $(".matrixBody").attr("data-headerid"),
    newArchiveBox: $(".matrixarchiveInput").val(),
    newTaskCreated: $(".currentLoggedOn").attr("data-userfn")
  }).done(function(){

    delegateUpdate("Archive")})
})

$(document).on("click",".archiveCancel", function(){
  $(".archiveInput").remove()
})

$(document).on("click",".deleteUser", function(){
  $.post("/removeDelegate", {
    SelectedId: $(".matrixBody").attr('data-headerid'),
    SpecificId: $(".clickedBooking").attr('data-specificid'),
    Userid: $(this).closest(".delegateDetailsMatrix").attr("data-userid")
  }).done(function(){
    delegateUpdate("Deleted")
    detailsUpdate($(".matrixBody").attr('data-headerid'),$(".clickedBooking"))
    setTimeout(function(){
      $(".OverlayTwo").animate({'left': '-100%'})
      $('.OverlayTwo').removeClass("Open")
     $(".delegateForm").trigger('reset')
     $(".delegateImgTwo").css({'background-image': "url('/Images/vortalPortraitStandIn.png')"})
     $(".delegateDetailsEdit").removeAttr("data-userid")
    },100)
  })
})


function trainerMatrixLoad() {
  $(".trainerMatrixDetails").remove()
  $.get("/trainerMatrix", function(data){
    for(i = 0; i <= data.length -1; i++){
      let item = data[i]
      $(".trainerMatrixList").append('<tr class="trainerMatrixDetails" data-trainerid="'+item._id+'"><td>'+item.FullName+'</td><td><li>'+item.Email+'</li><li>'+item.ContactNumber+'</li></td><td>'+item.Location+'</td><td>'+item.Approved+'</td></tr>')
    }
  })
}

$(document).on("click",".trainerMatrixDetails", function(){
  trainerContactDetails($(this).attr("data-trainerid"))
  trainerRegDetails($(this).attr("data-trainerid"))
  trainerCertDetails($(this).attr("data-trainerid"))
  trainerCourseDetails($(this).attr("data-trainerid"))
  trainerFolderLoad($(this).attr("data-trainerid"))
  $(".trainerFull").attr('data-trainerid',$(this).attr("data-trainerid"))
})

function trainerContactDetails(id){
  $(".trainerAddCV").remove()
  $(".trainerViewCV").remove()
  $(".activeTrainerMatrix").val('')
  $("#tmDateOfBirth").val('')
  $("#tmEmailAddress").val('')
  $("#tmNumber").val('')
  $("#tmCompany").val('')
  $("#tmRate").val('')
  $("#tmLocation").val('')
  let selected = id
  $.post("/trainerRetrieve", {id: id}).done(function(data){
    let current = data
    if(current._id == selected){
      $(".trainerName").html(current.FullName + '<i class="fa-solid fa-pen-to-square editTrainerName"></i>')
      let activity = ""
      if(current.Approved == true){
        activity = "Active"
      } else {
        activity = "Not Active"
      }
      $(".activeTrainerMatrix").val(activity)
      $("#tmDateOfBirth").val(current.DateOfBirth)
      $("#tmEmailAddress").val(current.Email)
      $("#tmNumber").val(current.ContactNumber)
      $("#tmCompany").val(current.Company)
      $("#tmRate").val(current.Rate)
      $("#tmLocation").val(current.Location)
      if(current.TrainerCV.length == 0){
        $(".trainerCVLocation").append('<p class="trainerAddCV">Click to add CV</p>')
      } else {
        $(".trainerCVLocation").append('<p class="trainerViewCV">'+$(current.TrainerCV).last()[0].FileName+'<span>  Replace  <i class="fa-solid fa-x"></i></span></p>')
      }
    }
  })
}

function trainerRegDetails(id){
  $(".regAwardingBody").children().remove()
  $(".specificRegDetails").remove()
  $.get("/courses", function(data){
    for(i=0; i<= data.length - 1; i++){
      $(".regAwardingBody").append('<option value="'+data[i].AwardingBody+'">'+data[i].AwardingBody+'</option>')
        if( i == 0){
          for(t = 0; t<= data[i].Courses.length  -1 ;t++ ){
            let thisCourse = data[i].Courses[t]
            $(".regCourseSelect").append('<option value="'+thisCourse.Course+'">'+thisCourse.Course+'</option>')
          }
        }
    }
  })
    $.post("/trainerRetrieve", {id: id}).done(function(data){
      let selected = data
      if(selected._id == id){
        for(t = 0; t<= selected.RegistrationNumber.length-1; t++){
          let regNumber = selected.RegistrationNumber[t]
          $(".regDetailsTM").append('<div class="specificRegDetails" data-regnumber="'+regNumber._id+'"><div class="regDetailsAB">'+regNumber.AwardingBody+'</div><div class="regDetailsRN">'+regNumber.RegNumber+'</div><div><i class="fa-solid fa-trash deleteReg"></i></div></div>')
        }
      }
    })
}

$(".regAwardingBody").on("change", function(){
  $(".regCourseSelect").children().remove()
  let currentSelect = $(this).val()
  $.get("/courses", function(data){
    for(i=0; i<= data.length - 1; i++){
        if(data[i].AwardingBody == currentSelect){
          for(t = 0; t<= data[i].Courses.length  -1 ;t++ ){
            let thisCourse = data[i].Courses[t]
            $(".regCourseSelect").append('<option value="'+thisCourse.Course+'">'+thisCourse.Course+'</option>')
          }
        }
    }
  })
})

function trainerCertDetails(id){
  $.post("/trainerRetrieve", {id: id}).done(function(data){
    let selected = data
    if(selected._id == id){
      for(t = 0; t<= selected.Certificates.length-1; t++){
        let certDetails = selected.Certificates[t]
        $(".tmListCertifications").append('<div class="certDetailsTM" data-filekey="'+certDetails.FileKey+'"><i class="fa-solid fa-file"></i> '+certDetails.FileName+'</div>')
      }
    }

  })
}


function trainerCourseDetails(id){
  $(".tmCourseScroll").children().remove()
  $.post("/trainerRetrieve", {id: id}).done(function(data){
    let selected = data
    if(selected._id == id){
      for(t = 0; t<= selected.Courses.length-1; t++){
        let certDetails = selected.Courses[t]
        var expiredTotal = 0
        if($(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).length == 0){
          if(new Date(certDetails.ExpiryDate).toISOString().substring(0,10) < new Date(new Date().setDate(new Date().getDate()+7)).toISOString().substring(0,10)){
            $(".tmCourseScroll").append('<div class="awardingBodyTM' + certDetails.AwardingBody+' awardingList"><div class="awardingBodyHeader"><div>'+certDetails.AwardingBody+'  (<span class="coursesTotal">1</span>)<i class="fa-solid fa-caret-down extendCourses"></i><span class="expiredItems">   Expired (<span class="expiredTotal">0</span>)</span></div></div><div class="courseGroup hidden"><div class="specificCourseData expiredCourse" data-courseid="'+certDetails._id+'"><div class="specifcCourseBody">'+certDetails.Course+'</div><div class="specifcCourseBody"> Expires: '+new Date(certDetails.ExpiryDate).toLocaleDateString('en-GB')+'</div><div class="courseActions" ><i class="fa-solid fa-trash deleteCourse"></i></div></div></div></div>')
            let expiredTotal = Number($(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".expiredTotal").text()) + 1
            $(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".expiredTotal").text(expiredTotal)
          } else {
            $(".tmCourseScroll").append('<div class="awardingBodyTM' + certDetails.AwardingBody+' awardingList"><div class="awardingBodyHeader"><div>'+certDetails.AwardingBody+'  (<span class="coursesTotal">1</span>)<i class="fa-solid fa-caret-down extendCourses"></i></div></div><div class="courseGroup hidden"><div class="specificCourseData" data-courseid="'+certDetails._id+'"><div class="specifcCourseBody">'+certDetails.Course+'</div><div class="specifcCourseBody"> Expires: '+new Date(certDetails.ExpiryDate).toLocaleDateString('en-GB')+'</div><div class="courseActions"><i class="fa-solid fa-trash deleteCourse"></i></div></div></div></div>')
          }
        } else {
          if(new Date(certDetails.ExpiryDate).toISOString().substring(0,10) < new Date(new Date().setDate(new Date().getDate()+7)).toISOString().substring(0,10)){
            $(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".courseGroup").append('<div class="specificCourseData expiredCourse" data-courseid="'+certDetails._id+'"><div class="specifcCourseBody">'+certDetails.Course+'</div><div class="specifcCourseBody"> Expires: '+new Date(certDetails.ExpiryDate).toLocaleDateString('en-GB')+'</div><div class="courseActions"><i class="fa-solid fa-trash deleteCourse"></i></div></div></div>')
            let expiredTotal = Number($(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".expiredTotal").text()) + 1
                          $(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".expiredTotal").text(expiredTotal)
          } else {
            $(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".courseGroup").append('<div class="specificCourseData" data-courseid="'+certDetails._id+'"><div class="specifcCourseBody">'+certDetails.Course+'</div><div class="specifcCourseBody"> Expires: '+new Date(certDetails.ExpiryDate).toLocaleDateString('en-GB')+'</div><div class="courseActions"><i class="fa-solid fa-trash deleteCourse"></i></div></div></div>')
          }
          let total = Number($(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".coursesTotal").text()) + 1
          $(".tmCourseScroll").find(".awardingBodyTM" + certDetails.AwardingBody).find(".coursesTotal").text(total)
        }
      }
    }
  })
}


$(document).on("click",".extendCourses", function(){
  if($(this).hasClass("fa-caret-up")){
    $(this).addClass("fa-caret-down").removeClass("fa-caret-up")
    $(this).closest(".awardingList").find(".courseGroup").slideUp()
  } else {
    $(this).addClass("fa-caret-up").removeClass("fa-caret-down")
    $(this).closest(".awardingList").find(".courseGroup").slideDown()
  }
})

$(document).on("change",".matrixstageInvNo", function(){
  $(this).parent().find(".matrixstageInvDate").val(new Date().toISOString().substr(0,10))
})


$(document).on("click",".addCourseTrainer", function (){
  let awardingBody = $(".trainerAwardingBody").val()
  let course = $(".trainerCourseSelect").val()
  let expDate = $(".trainerCourseExp").val()

  $.post("/trainerCourseAddition",{
    awardingBody: awardingBody,
    course: course,
    expDate: expDate,
    trainerId: $(".trainerFull").attr("data-trainerid")
  }).done(function(){
    delegateUpdate("TrainerCourseAdded")
    trainerCourseDetails($(".trainerFull").attr("data-trainerid"))
  })
})

$(document).on("click", ".deleteCourse", function(){
  let thisParent = $(this).closest(".specificCourseData")
  $.post("/removeTrainerCourse", {
    trainerId: $(".trainerFull").attr('data-trainerid'),
    courseId: $(this).closest(".specificCourseData").attr('data-courseid')
  }).done(function(){
    let higherParent = $(thisParent).closest(".courseGroup").closest(".awardingList")
    let parent = $(thisParent).closest(".courseGroup")
    $(thisParent).remove()
    if($(parent).children().length == 0){
      $(higherParent).remove()
    } else {
      let totalExpired = $(higherParent).find(".expiredCourse").length
      let totalCourses = $(higherParent).find(".specificCourseData").length
      if(totalExpired > 0){
        $(higherParent).find(".expiredTotal").text(totalExpired)
      } else {
        $(higherParent).find(".expiredItems").hide()
      }
      if(totalCourses > 0){
        $(higherParent).find(".coursesTotal").text(totalCourses)
      }
      console.log(totalExpired);
    }

    // trainerCourseDetails($(".trainerFull").attr("data-trainerid"))
  })
})


$(document).on("click", ".addTrainerReg", function(){
  $.post("/trainerRegAdd",{
    AwardingBody: $(".trainerAwardingSelect").val(),
    RegNumber: $(".trainerRegNumber").val(),
    trainerId: $(".trainerFull").attr("data-trainerid")
  }).done(function(){
    delegateUpdate("TrainerRegAdded")
    trainerRegDetails($(".trainerFull").attr("data-trainerid"))
  })
})

$(document).on("click",".trainerAddCV", function(){
  $("#trainerCVUpload").trigger('click')
})

$(document).on("change","#trainerCVUpload", function(){
  $("#trainerCVUploadForm").submit()
})

$(document).on("submit","#trainerCVUploadForm", function(event){
    event.preventDefault();
    var data = new FormData($(this)[0]);
    data.append('trainerId', $(".trainerFull").attr("data-trainerid"))
    data.append('trainerName', $(".trainerName").text())
    $.ajax({
               url:'/trainerAddCV',
               type: 'POST',
               contentType: false,
               processData: false,
               cache: false,
               data: data,
               error: function(){
                   alert('Error: Document could not be uploaded, please try again');
               },
               complete: delegateUpdate("Inserted CV")
           })
})

$("#matrixPaidCheck").on("change", function(){
  if ($(this).prop("checked")) {
    $(this).parent().children("#stagePaidDate").val(new Date().toISOString().substr(0,10))
  } else {
    $(this).parent().children("#stagePaidDate").val('')
  };
})

$(".letterGenerator").on("click", function(){
  $.post("/letterheadPDF", {
    headerid:$(".matrixBody").attr('data-headerid'),
    selectedid:$(".clickedBooking").attr('data-specificid'),
    user: $(".currentLoggedOn").attr('data-userfn')
  }).done(function(data){
    $(".bodyMain").append('<a class="letterDownload" href="'+data.name+'" target="_blank" download="'+data.title+' letterhead.pdf">')
    $(".letterDownload")[0].click()
    $(".letterDownload").remove()
    notesUpdates($(".matrixBody").attr('data-headerid'))
  })
})


$(document).on("click",".delegateImg" ,function(){
  let delegate = $(this).closest('.delegateDetailsMatrix').find('.baseInfo').children('div').eq(0).children('li').eq(0).text().substring(12)
if($(this).css('background-image').includes('vortalPortraitStandIn')==false){
  $.post("/downloadImage",{
    key: $(this).attr('data-imagekey')
  }).done(function(data){
    let created = $(".bodyMain").append('<a class="delegateDownload" href='+data+' download="'+delegate+'.png">')
    setTimeout(function(){
        $(".delegateDownload")[0].click()
        $(".delegateDownload").remove()
    },600)
  })
}
})


$(".registerGenerator").on("click", function(){
  $.post("/registerGen", {
    headerid:$(".matrixBody").attr('data-headerid'),
    user: $(".currentLoggedOn").attr('data-userfn')
  }).done(function(data){
    $(".bodyMain").append('<a class="test" href="'+data.name+'" target="_blank" download="'+data.title+' Register.pdf">')
    $(".test")[0].click()
    $(".test").remove()
    notesUpdates($(".matrixBody").attr('data-headerid'))
  })
})

$(".generatePDFList").on("click", function(){
  if($(".actionsList").hasClass("openList")){
    $(".actionsList").slideUp().removeClass("openList")
    $(this).find(".fa-chevron-up").addClass("fa-chevron-down").removeClass("fa-chevron-up")
  } else {
    $(".actionsList").slideDown().addClass("openList")
    $(this).find(".fa-chevron-down").addClass("fa-chevron-up").removeClass("fa-chevron-down")
  }

})

var delegateView = "closed"

$(".matrixTab").on("click", function(){
  $(".matrixItem").slideUp()
  $(".matrixTab").removeClass("selectedTab")
  delegateView = "closed"
  let item = this
  switch ($(this).attr('data-tabselect')) {
    case "invoice": $(".invoiceSection").slideDown()
                    $(item).addClass("selectedTab")

      break;
      case 'home': $(".bookingDetails").slideDown()
                    $(item).addClass("selectedTab")
        break;
        case "delegates": $(".delegateMatrixDetails").slideDown()
                          $(item).addClass("selectedTab")
                          $(".delegateDetailsMatrix").remove()
                          delegateMatrixLoad()

          break;
          case "changelog":$(".changeLogMatrix").slideDown()
                            $(item).addClass("selectedTab")

            break;
  }
})

function matrixReset(){
  $(".matrixItem").slideUp()
  $(".matrixTab").removeClass("selectedTab")
  $(".bookingDetails").slideDown()
  $(".matrixTab").eq(0).addClass("selectedTab")
}

function addCourseMatrix(awardingBody){
  $.get("/courses", function(data){
    for(i = 0; i <= data.length-1; i++){
      let dataAwarding = data[i]
      if(dataAwarding.AwardingBody == awardingBody){
        for(c = 0; c <= dataAwarding.Courses.length-1 ; c++){
          $("#matrixCourses").append('<option value="'+dataAwarding.Courses[c].Course+'">')
        }
      }
    }
  })
}


function resendConfirmation(){
  $.post("/resendConfirmation",{
    Email: $("#bookerEmailMatrix").val(),
    Organisation: $("#orgNameMatrix").val(),
    Name: $("#bookerNameMatrix").val(),
    SelectedId: $(".matrixBody").attr("data-headerid")
  })
}

$(document).on("click", ".deleteCourseMatrix", function(){
  $(this).closest(".courseRowsMatrix").remove()
})


var hoverLock = "unlocked"

$(document).on("click", ".diaryItems", function(){
  if(hoverLock == "unlocked"){
    hoverLock = "locked"
    $(".lockSymbol").removeClass("fa-lock-open").addClass("fa-lock")
  } else {
    hoverLock = "unlocked"
    $(".lockSymbol").removeClass("fa-lock").addClass("fa-lock-open")
    $(".detailsHere").children().remove()
  }
})


$(document).on({
    mouseenter: function () {
      let item = this
      var cnt = 0;
      counter = window.setInterval(function() {
    cnt = (cnt+1);
    if(cnt === 20){
      if(hoverLock == "unlocked"){
        $.post("/matrixRetrieve", {
          idOne:$(item).attr('data-headerid')
        }).done(function(items){
          for(b = 0; b <= items.Bookings.length-1; b++){
            if(items.Bookings[b]._id == $(item).attr('data-objid')){
              let booking = items.Bookings[b]
              let course = []
              let trainer = []
              if(items.VortexRef === "Holiday" || items.VortexRef === "Appointment"){
                  $(".detailsHere").append("<li>"+items.VortexRef+"</li><li><i class='fa-solid fa-calendar'></i> "+new Date(booking.Start).toLocaleDateString("EN-GB") +" - "+new Date(booking.End).toLocaleDateString("EN-GB") +"</li><li><i class='fa-solid fa-chalkboard-user'></i> "+booking.Trainer+"</li><li>"+items.Notes[0].Note+"</li>")

                } else {

                  if(booking.TrainerArray != undefined){
                    for(tr = 0; tr <= booking.TrainerArray.length -1; tr++){
                      trainer.push(booking.TrainerArray[tr].Trainer)
                    }
                  } else {
                    trainer = booking.Trainer
                  }


                for(c = 0; c <= booking.CourseInfo.length -1; c++){
                  let originalObj = booking.CourseInfo[c]
                  if(booking.CourseInfo[c].TestingType == "NPORS Testing Type"){
                    delete originalObj.TestingType
                  }
                  course.push("<li>" + JSON.stringify(originalObj).replaceAll('"','').replace("TestingType","Type").replace("BookedDelegates","Delegates").replace("{","").replace("}","").replaceAll(","," - ")+ "</li>");

              }
              $(".detailsHere").append("<li>"+items.VortexRef+"</li><li><i class='fa-solid fa-calendar'></i> "+new Date(booking.Start).toLocaleDateString("EN-GB") +" - "+new Date(booking.End).toLocaleDateString("EN-GB") +"</li><li><i class='fa-solid fa-chalkboard-user'></i> "+trainer.toString()+"</li><li><i class='fa-solid fa-building'></i>"+items.Organisation+"</li><li><i class='fa-solid fa-location-arrow'></i>"+booking.SiteLocation+"</li><li><i class='fa-solid fa-trophy'></i> "+booking.AwardingBody+"</li><li> Courses </li>"+course.toString().replaceAll(",",""))

              }

            }
          }
        })
      }
    }
}, 10);
},
    mouseleave: function () {
      window.clearInterval(counter);
$('.count').html("0");
      if(hoverLock == "unlocked"){
        $(".detailsHere").children().remove()
      }

    }
}, ".diaryItems:not(.temporary)");

$(document).on("click",".trainerFilterItem", function(){
  $('<div class="trainerfilteredListItem hidden">'+$(this).text()+'</div>').appendTo($(".trainerfilteredList")).slideDown(300)
  $(".orgFilterItem").addClass("diabledOrgFilterItem").removeClass('orgFilterItem')
  let item = this
  $(this).slideUp(300)
  setTimeout(function(){
    $(item).addClass("hidden")
  },400)
  itemMovement()
})

$(document).on("click",".orgFilterItem", function(){
  $('<div class="orgfilteredListItem">'+$(this).text()+'</div>').appendTo($(".orgfilteredList")).slideDown(300)
  $(".trainerFilterItem").addClass("diabledTrainerFilterItem").removeClass('trainerFilterItem')
  $(this).slideUp(300)
  let item = this
  $(this).slideUp(300)
  setTimeout(function(){
    $(item).addClass("hidden")
  },400)
  itemMovement()
})


$(document).on("click",".orgfilteredListItem", function(){
  $('.orgList li:contains('+$(this).text()+')').slideDown()
  let item = this
  $(this).slideUp(300)
  setTimeout(function(){
    $(item).remove()
    if($(".orgfilteredList").children().length == 0){
      $(".diabledTrainerFilterItem").addClass('trainerFilterItem').removeClass("diabledTrainerFilterItem")

    }
    itemMovement()
  },400)

})

$(document).on("click",".trainerfilteredListItem", function(){
  $('.trainerList li:contains('+$(this).text()+')').slideDown()
  let item = this
  $(this).slideUp(300)
  setTimeout(function(){
    $(item).remove()
    if($(".trainerfilteredList").children().length == 0){
      $(".diabledOrgFilterItem").addClass('orgFilterItem').removeClass("diabledOrgFilterItem")
    }
    itemMovement()
  },400)

})

$(".orgFilter").on("click", function(){
  $(".trainersListDiv").slideUp(200).removeClass("openTrainerList")
  if($(".orgListDiv").hasClass("openOrgList")){
    $(".orgListDiv").removeClass("openOrgList").slideUp(200)
  } else {
    $(".orgListDiv").addClass("openOrgList").slideDown(200)
  }

})

$(".trainerFilter").on("click", function(){
  $(".orgListDiv").slideUp(200).removeClass("openOrgList")
  if($(".trainersListDiv").hasClass("openTrainerList")){
    $(".trainersListDiv").removeClass("openTrainerList").slideUp(200)
  } else {
    $(".trainersListDiv").addClass("openTrainerList").slideDown(200)
  }

})

function matrixAddCourse(){

  let row = $(".courseRowsMatrix").eq(0).clone().appendTo(".courseInner")
  row.find(".form-control").val('')
  row.find(".form-select").val('')
}

$(".cancelBooking").on("click", function(){
  $.post("/matrixRetrieve", {
    idOne:$(".matrixBody").attr('data-headerid')
  }).done(function(data){
    for(i =0 ; i <= data.Bookings.length-1; i++){

      let courses = []
      for(c = 0; c<= data.Bookings[i].CourseInfo.length -1; c++){
        courses.push('<li>'+data.Bookings[i].CourseInfo[c].Course+'</li>')
      }
      if(i == 0){
        $(".cancellationRow").eq(i).attr('data-specificid',data.Bookings[i]._id )
        $(".cancelDates").eq(i).text(new Date(data.Bookings[i].Start).toLocaleDateString('EN-GB') + "-" + new Date(data.Bookings[i].Start).toLocaleDateString('EN-GB'))
        $(".cancelTrainer").eq(i).text(data.Bookings[i].Trainer)
        $(".cancelCourses").eq(i).html(courses.toString().replaceAll(",",""))
        $(".cancelRate").eq(i).val(data.Bookings[i].Rate).attr('data-originalrate', data.Bookings[i].Rate)
      } else {
        $(".cancellationRow").clone().appendTo(".cancelSpecifics")
        $(".cancellationRow").eq(i).attr('data-specificid',data.Bookings[i]._id )
        $(".cancelDates").eq(i).text(new Date(data.Bookings[i].Start).toLocaleDateString('EN-GB') + "-" + new Date(data.Bookings[i].Start).toLocaleDateString('EN-GB'))
        $(".cancelTrainer").eq(i).text(data.Bookings[i].Trainer)
        $(".cancelCourses").eq(i).html(courses.toString().replaceAll(",",""))
        $(".cancelRate").eq(i).val(data.Bookings[i].Rate).attr('data-originalrate', data.Bookings[i].Rate)
      }
    }
    $(".cancelOverlay").slideDown()
  })
})

function   cancelOverlay() {
  $(".cancellationRow").not(':first').remove();
  $(".cancelOverlay").slideUp()
  $(".cancellationDetails").slideUp()
  $(".otherReasonCancel").slideUp()
  $(".cancellationRow").find(".form-select").val($(".form-select option:first").val())
  $(".cancellationRow").find(".form-control").val('')
  $(".cancelCheck").prop('checked',false).val('false')
}

$(".cancelClose").on("click", function(){
cancelOverlay()
})



$(document).on("change",".cancelReason", function(){
  if($(this).val() == "Other"){
    $(this).closest(".cancellationRow").find(".otherReasonCancel").slideDown()
  } else {
    $(this).closest(".cancellationRow").find(".otherReasonCancel").slideUp()
  }
})

$(document).on("change",".cancelAmount", function(){
  let item  = this
  $(item).closest(".cancellationRow").find(".cancelRate").prop('disabled',true)
  let originalRate = $(item).closest(".cancellationRow").find(".cancelRate").attr('data-originalrate')
  let value = $(item).closest(".cancellationRow").find(".cancelRate").attr('data-originalrate')
switch ($(this).val()) {
  case "Yes - 100%": $(item).closest(".cancellationRow").find(".cancelRate").val(Number(value * 1))
    break;
  case "Yes - 50%": $(item).closest(".cancellationRow").find(".cancelRate").val(Number(value * 0.5))

    break;
  case "Yes - Other": $(item).closest(".cancellationRow").find(".cancelRate").removeAttr('disabled')

    break;
    case "No": $(item).closest(".cancellationRow").find(".cancelRate").val(0)

      break;

}
})

$(document).on("change",".cancelCheck", function(){
  let item = this
  if($(item).val() ==  'true'){
    $(item).closest(".cancellationRow").find(".cancellationDetails").slideDown().css({display:'flex'})
  } else {
    $(item).closest(".cancellationRow").find(".cancellationDetails").slideUp()
  }
})

$(".cancelConfirm").on("click", function(){
  for(i = 0; i <= $(".cancelCheck").length - 1; i++ ){
    let originalRate =  $(".cancelCheck").eq(i).closest(".cancellationRow").find(".cancelRate").attr('data-originalrate')
    let reason = ""
    let newRate = $(".cancelCheck").eq(i).closest(".cancellationRow").find(".cancelRate").val()
    if($(".cancelCheck").eq(i).val() == 'true'){

      if($(".cancelCheck").eq(i).closest(".cancellationRow").find(".cancelReason").val() == "Other"){
        reason = $(".cancelCheck").eq(i).closest(".cancellationRow").find(".otherReasonField").val()
      } else {
        reason = $(".cancelCheck").eq(i).closest(".cancellationRow").find(".cancelReason").val()
      }
      $.post("/courseCancel",{
        selectedId: $(".matrixBody").attr('data-headerid'),
        bookingId: $(".cancelCheck").eq(i).closest(".cancellationRow").attr('data-specificid'),
        user: $(".currentLoggedOn").attr('data-userfn'),
        newRate: $(".cancelCheck").eq(i).closest(".cancellationRow").find(".cancelRate").val()
      }).done(function(){
        $.post("/newNote",

          {
            postReqCurrent: $(".matrixBody").attr('data-headerid'),
            postReqNote: "Original Rate: £" + originalRate + " New Rate: £"+ newRate + "\nReason for Cancellation: " + reason,
            postReqUser: $(".currentLoggedOn").attr('data-userfn'),
            postReqSeverity: "Important",
            postReqTimeStamp: new Date($.now()).toLocaleDateString("en-GB")
          },
          function(data, status) {
            delegateUpdate("Course Cancelled")
          })
      })
    }
  }
})

$(".addTrainer").on("click", function(){
  let clone = $(".trainerDetails").eq(0).clone()
  $(".trainerDetails").last().after(clone)
  $(".removeLastTrainer").removeAttr('disabled')
})

$(".removeLastTrainer").on("click", function(){
  $(".trainerDetails").last().remove()
  if($(".trainerDetails").length == 1){
    $(".removeLastTrainer").attr('disabled',true)
  }
})

$(".bookingaddTrainer").on("click", function(){
  let parent = $(this).closest(".bRow")
  let clone = $(".bookingTrainerArray").eq(0).clone()
  $(parent).find(".bookingTrainerArray").last().after(clone)
  $(parent).find(".bookingremoveLastTrainer").removeAttr('disabled')
})

$(".bookingremoveLastTrainer").on("click", function(){
  let parent = $(this).closest(".bRow")
  $(parent).find(".bookingTrainerArray").last().remove()
  if($(".bookingTrainerArray").length == 1){
    $(parent).find(".bookingremoveLastTrainer").attr('disabled',true)
  }
})

$(".closeBookingForm").on("click", function(){
  $(".temporary").remove()
overFlow()
  $(".newBookingFormTwo").animate({right: '-40%'})
  $(".bookingSelect").val($(".bookingSelect option:first").val())
  $(".newBookingWindow").slideUp()
  hideNewItem()
})

$(".bookingSelect").on("change", function(){
  $(".formOptions").slideUp()
  switch ($(this).val()) {
    case "Training": $(".newBookingTrainingForm").slideDown()
                    $(".newBookingBookerInfo").delay(400).slideDown()
      break;
    case "Holiday":  $(".newHolidayBooking").slideDown()
                    $(".newTrainerSelectHolAppt").children().remove()
                    $.post("/orgRetrieve",{
                      Name: 'Vortex'
                    }).done(function(data){
                      let userArray = []
                      for(i = 0; i <= data.User.length-1;i++){
                        userArray.push(data.User[i].FullName)
                      }

                      userArray.sort(function(a,b){
                        if(a.toUpperCase() < b.toUpperCase()) { return -1; }
                        if(a.toUpperCase() > b.toUpperCase()) { return 1; }
                        return 0;
                      })

                      for(u = 0; u <= userArray.length -1; u++){
                        $(".newTrainerSelectHolAppt").append('<option value="'+userArray[u]+'">'+userArray[u]+'</option>')
                      }


                    })
    break;
    case "Appointment":  $(".newHolidayBooking").slideDown()
    $(".newTrainerSelectHolAppt").children().remove()
    $.post("/orgRetrieve",{
      Name: 'Vortex'
    }).done(function(data){
      let userArray = []
      for(i = 0; i <= data.User.length-1;i++){
        userArray.push(data.User[i].FullName)
      }

      userArray.sort(function(a,b){
        if(a.toUpperCase() < b.toUpperCase()) { return -1; }
        if(a.toUpperCase() > b.toUpperCase()) { return 1; }
        return 0;
      })

      for(u = 0; u <= userArray.length -1; u++){
        $(".newTrainerSelectHolAppt").append('<option value="'+userArray[u]+'">'+userArray[u]+'</option>')
      }


    })
    break;
    default:

  }
})


$("#orgNameMatrix").on("change", function(){
  $.post("/orgRetrieve", {
    Name: $(this).val()
  }).done(function(data){
    $("#bookerNameMatrix").children().remove()
    if(data.User != undefined){
      for(i = 0; i <= data.User.length -1; i++){
        $("#bookerNameMatrix").append('<option value ="'+data.User[i].FullName+'">'+data.User[i].FullName+'</option>')
      }
    }

  })
})

$("#bookerNameMatrix").on("change", function(){
  let result = $(this).val()
  $.post("/orgRetrieve", {
    Name: $("#orgNameMatrix").val()
  }).done(function(data){
    for(i = 0; i <= data.User.length -1; i++){
      if(data.User[i].FullName == result){
        $("#bookerEmailMatrix").val(data.User[i].EmailAddress)
      }
      $("#bookerNameMatrix").append('<option value ="'+data.User[i].FullName+'">'+data.User[i].FullName+'</option>')
    }
  })
})


$(".removeImage").on("click", function(){
  if(!$(".delegateImgTwo").css('background-image').includes('/Images/vortalPortraitStandIn.png')){
    let alert = confirm("Are you sure you want to delete this Delegates Photo?")
    if(alert === true){
      $.post("/removeImage",{
          SelectedId: $(".matrixBody").attr('data-headerid'),
          SpecificId:$(".clickedBooking").attr('data-specificid'),
          UserId: $(".delegateDetailsEdit").attr('data-userid')
      }

    ).done(function(data){
      $(".delegateImgTwo").css({'background-image': 'url("/Images/vortalPortraitStandIn.png")'})
      if(data == "No Image"){
        $("#changePhoto").val(null)
      } else {
        $(".delegateDetailsMatrix").remove()
        delegateMatrixLoad()
      }
    })
    }
  }


})

$("html").on("dragover", function(e) {
      e.preventDefault();
      e.stopPropagation();
      switch (true) {
        case $(".matrixBody").css('display') == 'block':
        $(".matrixDocuments").addClass("highlightedUpload")
        if($(e.target).closest(".matrixDocuments").length == 0){
          $(".matrixDocuments").removeClass("highlightedUploadSelected")
        }
          break;
        default:

      }

  });
$("html").on("drop", function(e) {
  e.preventDefault();
  e.stopPropagation();
  $(".matrixDocuments").removeClass("highlightedUpload")
});

$(".matrixDocuments").on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(".matrixDocuments").removeClass("highlightedUpload")
        $(".matrixDocuments").addClass("highlightedUploadSelected")
    });
$(".matrixDocuments").on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(".matrixDocuments").removeClass("highlightedUpload")
            $(".matrixDocuments").removeClass("highlightedUploadSelected")

            const dt = new DataTransfer()
            for(i =0; i <= e.originalEvent.dataTransfer.files.length -1; i++){
              dt.items.add(e.originalEvent.dataTransfer.files[i])
            }
            documentUpload.files = dt.files
            $("#documentUpload").trigger('change')
        });


$(document).on("click", ".deleteReg", function(){
  let remove = $(this).closest(".specificRegDetails")
  $.post("/regNumberDelete",{
    trainerId: $('.trainerFull').attr('data-trainerid'),
    regId: $(this).closest(".specificRegDetails").attr('data-regnumber')
  }).done(function(){
    $(remove).remove()
  })
})

$(".newDocumentTM").on("click", function(){
  $(".folderDocumentsTM").append('<div class="tmTempFolder"><i class="fas fa-folder tmFolderSpecific"></i><input type="text" name="" value="" class="form-control newTMDoc" placeholder="New Folder Name"></div>').focus()
})

function trainerFolderLoad(trainerId){
  $(".uploadTo").removeClass(".uploadTo")
  $(".noDocsPHTM").show()
        $(".tmFolder").remove()
  $.post("/trainerRetrieve", {
    id: trainerId
  }).done(function(data){
    if(data.Documents != undefined){
      $(".noDocsPHTM").hide()
      for(i = 0; i <= data.Documents.length-1; i++){
        $(".folderDocumentsTM").append('<div class="tmFolder" id="'+data.Documents[i].FolderName+'"><i class="fas fa-folder tmFolderSpecific" data-tdfoldnamer="'+data.Documents[i].FolderName+'"></i><h8>'+data.Documents[i].FolderName+'<span class="documentSize">(0)</span>'+'</h8><div><div class="trainerLoadingBar"><span class="trainerLoadingPercent"></span></div></div></div>').focus()
          for(d = 0; d <= data.Documents[i].Files.length -1; d++){
            $("#"+data.Documents[i].FolderName).find(".documentSize").text("("+data.Documents[i].Files.length+")")
          }
      }
    }
  })
}

function specificTrainerFolderLoad(trainerId, folder){
  $.post("/trainerRetrieve", {
    id: trainerId
  }).done(function(data){
    if(data.Documents != undefined){
      $(".noDocsPHTM").hide()
      for(i = 0; i <= data.Documents.length-1; i++){
          if(data.Documents[i].FolderName == folder){
            for(d = 0; d <= data.Documents[i].Files.length -1; d++){
              $("#"+data.Documents[i].FolderName).find(".documentSize").text("("+data.Documents[i].Files.length+")")
            }
          }

          if(i == data.Documents.length-1){
            $("#"+data.Documents[i].FolderName).removeClass("uploadTo")
          }
      }
    }
  })

}

$(document).on("keypress",".newTMDoc", function(e){
  let folderName = this.value.replaceAll(" ","_")

  if(e.code == "Enter"){
    $.post("/trainerFolderAdd",{
      trainerId: $(".trainerFull").attr('data-trainerid'),
      folderName: folderName
    }).done(function(){
      $(".tmTempFolder").remove()
      trainerFolderLoad($(".trainerFull").attr('data-trainerid'))
    })
  }
})

$("#trainerDocsUpload").on("change", function(){
  $("#trainerDocsUploadForm").submit()
})

$(document).on("click",".tmFolder", function(){
  let selected = $(this).attr('id')
  trainerDocsLoad(selected)
  $(".folderDocumentsTM").animate({  'width': '50%'},400)
    $(".folderView").show()
  $(".folderView").animate({'width': '50%'},400)


})

function trainerDocsLoad(selected){
  $(".listTrainerDocs").remove()
  $(".folderView").attr('data-folderLocation',selected)
  $.post("/trainerRetrieve",{
    id: $(".trainerFull").attr('data-trainerid')
  }).done(function(data){
    for(i =0 ; i<= data.Documents.length-1; i++){
      if(data.Documents[i].FolderName == selected){
        console.log(data.Documents[i].Files.length - 1);
        for(d = 0; d <= data.Documents[i].Files.length -1; d++){
          $(".folderView").append('<li class="listTrainerDocs" data-filelocation="'+data.Documents[i].Files[d].FileLocation+'">'+data.Documents[i].Files[d].FileName+'</li>')
        }
      }
    }
  })
}


$('html').on('dragenter',".tmFolder" ,function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(".uploadTo").removeClass("uploadTo")
        $(this).addClass("uploadTo")
    });

$('html').on('drop',".tmFolder" ,function (e) {
            e.stopPropagation();
            e.preventDefault();
            const dt = new DataTransfer()
            for(i =0; i <= e.originalEvent.dataTransfer.files.length -1; i++){
              dt.items.add(e.originalEvent.dataTransfer.files[i])
            }
            trainerDocsUpload.files = dt.files
            $("#trainerDocsUpload").trigger('change')
        });
        $('html').on('dragenter',".folderView" ,function (e) {
                e.stopPropagation();
                e.preventDefault();
                $(".uploadTo").removeClass("uploadTo")
                console.log($(this).attr('data-folderlocation'));
                $("#"+$(this).attr('data-folderlocation')).addClass("uploadTo")

            });

        $('html').on('drop',".folderView" ,function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    const dt = new DataTransfer()
                    for(i =0; i <= e.originalEvent.dataTransfer.files.length -1; i++){
                      dt.items.add(e.originalEvent.dataTransfer.files[i])
                    }
                    trainerDocsUpload.files = dt.files
                    $("#trainerDocsUpload").trigger('change')
                });


$("#trainerDocsUploadForm").on("submit", function(event){
  let uploadingLoading = $(".uploadTo").find(".trainerLoadingBar")
  let uploadBarPer = $(".uploadTo").find(".trainerLoadingPercent")
  let folder = $(".uploadTo").attr("id")
  $(uploadingLoading).show()
  $(uploadBarPer).text('0%')
    event.preventDefault();
    var data = new FormData($('#trainerDocsUploadForm')[0]);
    data.append('trainerId', $(".trainerFull").attr("data-trainerid"))
    data.append('selectedFolder', $(".uploadTo").attr("id"))
      $.ajax({
        xhr: function() {
var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt){
              if (evt.lengthComputable) {
                      var percentComplete = Math.floor(Number((evt.loaded / evt.total) * 100))
                      var percentRemain = percentComplete - 100
                      $(uploadingLoading).css({'background': 'linear-gradient(90deg, green '+percentComplete+'%, rgba(0, 0, 0, 0) '+percentRemain+'%)'})
                      $(uploadBarPer).text(percentComplete + '%')
                    if(percentComplete === 100){
                      $(uploadBarPer).text('Just Finishing Up..')
                    }
                      }
                    }, false);
                  return xhr;
                  },

                 url:'/trainerDocsUpload',
                 type: 'POST',
                 contentType: false,
                 processData: false,
                 cache: false,
                 data: data,
                 error: function(){
                     alert('Error: Document could not be uploaded, please try again');
                 },
                 complete: function(data) {
                   $(uploadingLoading).hide()
                     specificTrainerFolderLoad($(".trainerFull").attr('data-trainerid'), $(".uploadTo").attr("id"))
                     console.log($("#"+folder).removeClass("uploadTo"));
                 }
             })
})


$(".submitHolorApp").on("click", function(){
  let endDateCalc = new Date($(".holApptEnd").val()).getTime()
  let startDateCalc = new Date($(".holApptStart").val()).getTime()
  let calcTotal1 = endDateCalc - startDateCalc
  let calcTotal2 = calcTotal1 / (1000 * 3600 * 24) + 1;
  const getRanHex = size => {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for (let n = 0; n < size; n++) {
      result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
  }
  let trainer = $(".newTrainerSelectHolAppt").val()
  let start = $(".holApptStart").val()
  let end = $(".holApptEnd").val()
  let status = $(".bookingSelect").val()
  let array = [{
    _id: getRanHex(24),
    Trainer: trainer,
    Start: start,
    End: end,
    el: start.replaceAll("-0","").replaceAll("-",""),
    TrainerStage:[{
      Stage: "New"
    }],
    TotalDays:calcTotal2
  }]
  let details = [{
    CreatedBy: $(".currentLoggedOn").attr("data-userfn"),
    CreatedAt: new Date().toLocaleDateString("EN-GB"),
    Note: $(".holAppDetails").val(),
    Severity: "Standard"
  }]

  $.post("/AppointmentHoliday",{
    Start: start,
    End: end,
    Details: details,
    Status: status,
    Array: array
  }).done(function(){
    delegateUpdate("Hol/Appt Booked")
  })
})
