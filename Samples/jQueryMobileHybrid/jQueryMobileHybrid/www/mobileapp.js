/*
 * Copyright (c) 2011, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

function errorCallback(jqXHR){
  console.log(jqXHR.statusText + ": " + jqXHR.responseText);
}

function addClickListeners() {
  $('#newbtn').click(function(e) {
    // Show the 'New Account' form
    e.preventDefault();
    $('#form')[0].reset();
    $('#formheader').html('New Contact');
    // Change the action button to 'Create'
    setButtonText('#actionbtn', 'Create');
    $('#actionbtn').unbind('click.btn').bind('click.btn', createHandler);
    $.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
  });

  $('#deletebtn').click(function(e) {
    // Delete the account
    e.preventDefault();
    $.mobile.loading( "show", { text: 'Loading', textVisible: true } );

    client.del('Contact', $('#detail').find('#outputId').val(), function(response) {
      getRecords(function() {
        $.mobile.loading( "hide");
        $.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
      });
    }, errorCallback);
  });

  $('#editbtn').click(function(e) {
    // Get account fields and show the 'Edit Account' form
    e.preventDefault();
    $.mobile.loading( "show", { text: 'Loading', textVisible: true } );

    client.retrieve("Contact", $('#detail').find('#outputId').val(), 
      "Name,FirstName,LastName,Id,Email",
      function(response) {
        // Set the field values
        $('#form').find('input').each(function() {
          var fieldName = $(this).attr("name").replace(/^input/, '');
          $(this).val(response[fieldName]);
        });
        $('#formheader').html('Edit Contact');
        // Change the action button to 'Update'
        setButtonText('#actionbtn', 'Update');
        $('#actionbtn')
          .unbind('click.btn')
          .bind('click.btn', updateHandler);
        $.mobile.loading( "hide");
        $.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
      }, errorCallback);
  });
}

// Populate the list and set up click handling
function getRecords(callback) {
  console.log('In getRecords');
  $('#list').empty();
  client.query("SELECT Id, Name, FirstName, LastName FROM Contact ORDER BY Name LIMIT 20",
  function(response) {
    console.log('received '+JSON.stringify(response.records));
    var $detailpage = $('#detailpage');
    $.each(response.records, function() {
      var id = this.Id;
      $('<li></li>')
        .hide()
        .append('<a><h2>' + this.Name + '</h2></a>')
        .click(function(e) {
          e.preventDefault();
          $.mobile.loading( "show", { text: 'Loading', textVisible: true } );

          client.retrieve("Contact", id, "Name,FirstName,LastName,Id,Email", function(response) {
            $.each( response, function( key, value ) {
              var $el = $detailpage.find('#output'+key);
              if ($el) {
                if (key === 'Id') {
                  $el.val(value);
                } else {
                  $el.html(value);
                }
              }
            });
            $.mobile.loading("hide");
            $.mobile.changePage( "#detailpage" , { reverse: false, changeHash: true } );
          }, errorCallback);
        })
        .appendTo('#list')
        .show();
    });

    $('#list').listview('refresh');

    if (typeof callback != 'undefined' && callback != null) {
      callback();
    }
  }, errorCallback);
}

// Gather fields from the account form
function gatherFields($form) {
  var fields = {};
  $form.find('input').each(function() {
    var $child = $(this);
    if ($child.val().length > 0 && $child.attr("name") != 'inputId') {
      var fieldName = $child.attr("name").replace(/^input/, '');
      fields[fieldName] = $child.val();
    }
  });

  return fields;
}

// Create a record
function createHandler(e) {
  e.preventDefault();
  var fields = gatherFields($('#form'));
  $.mobile.loading( "show", { text: 'Loading', textVisible: true } );

  client.create('Contact', fields, function(response) {
    getRecords(function() {
      $.mobile.loading( "hide" );
      $.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
    });
  }, errorCallback);
}

// Update a record
function updateHandler(e) {
  e.preventDefault();
  var $form = $('#form');
  var fields = gatherFields($form);
  $.mobile.loading( "show", { text: 'Loading', textVisible: true } );

  client.update('Contact', $form.find('#inputId').val(), fields, function(response) {
    getRecords(function() {
      $.mobile.loading( "hide");
      $.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
    });
  }, errorCallback);
}

// This is required to change text on a jQuery Mobile button
// due to the way it futzes with things at runtime
function setButtonText(id, str) {
  $(id).html(str).parent().find('.ui-btn-text').text(str);
}
