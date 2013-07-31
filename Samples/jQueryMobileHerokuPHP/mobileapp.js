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

/*
  * This is a simple jQuery Mobile-based app that uses the Force.com REST API.
  * See mobile.page for code required to run this in Visualforce
  * See mobile.html for code required to run this on your own server
  */

var Contacts = new SObjectData();
function errorCallback(jqXHR){
    console.log(jqXHR.statusText + ": " + jqXHR.responseText);
}

function addClickListeners() {
    $j('#actionbtn').click(syncHandler);
	
	$j('#newbtn').click(function(e) {
        // Show the 'New Account' form
        e.preventDefault();
        $j('#form')[0].reset();
        $j('#formheader').html('New Contact');
        setButtonText('#actionbtn', 'Create');
		Contacts.dataObject = null;
        $j.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
    });

    $j('#deletebtn').click(function(e) {
        // Delete the account
        e.preventDefault();
        $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
        Contacts.remove(Contacts.dataObject,function() {
			getRecords();
			$j.mobile.loading("hide");
            $j.mobile.changePage( "#mainpage" , { reverse: false, changeHash: true } );
		});
    });

    $j('#editbtn').click(function(e) {
        // Get account fields and show the 'Edit Account' form
        e.preventDefault();
        $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
		
		$j('input#FirstName').val(Contacts.dataObject.FirstName);
		$j('input#LastName').val(Contacts.dataObject.LastName);
        $j('input#Email').val(Contacts.dataObject.Email);
        $j('input#Id').val(Contacts.dataObject.Id);
		
        $j('#formheader').html('Edit Contact');
        setButtonText('#actionbtn', 'Update');
        $j.mobile.loading( "hide");
        $j.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
        });
}

// Populate the list and set up click handling
function getRecords(callback) {
	console.log('In getRecords');
    $j('#list').empty();
    Contacts.fetch("soql","SELECT Id, FirstName, LastName, Email FROM Contact ORDER BY Name LIMIT 20",
    function() {
		$j.each(Contacts.data(),
        function() {
            var id = this.Id;
            var newLi = $j('<li></li>');
			var newLink = $j('<a id="' +this.Id+ '" data-transition="flip">' +this.FirstName+ ' '+this.LastName+ '</a>')
			.click(function(e) {
                e.preventDefault();
				Contacts.dataObject = Contacts.findRecordById([this.id]);
			 	$j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
                $j('#FirstName').html(Contacts.dataObject.FirstName);
				$j('#LastName').html(Contacts.dataObject.LastName);
                $j('#Email').html(Contacts.dataObject.Email);
                $j('#Id').val(Contacts.dataObject.Id);
                $j.mobile.loading("hide");
                $j.mobile.changePage( "#detailpage" , { reverse: false, changeHash: true } );
                });
           		newLi.append(newLink);            
                newLi.appendTo('#list');
        });
		$j('input#FirstName').val();
		$j('input#LastName').val();
        $j('input#Email').val();
        $j('input#Id').val();
		$j.mobile.loading( "hide" );
		$j('#list').listview('refresh');
	});
}


// Gather fields from the contact form and update a record
function syncHandler(e) {
    e.preventDefault();
	console.log('In Sync, Create or Update?	');
    var form = $j('#form');
    $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
	var record = Contacts.create();
	if(Contacts.dataObject != null) { record = Contacts.dataObject; } 
	record.FirstName = $j('input#FirstName').val();
	record.LastName = $j('input#LastName').val();
	record.Email = $j('input#Email').val();
	
	console.log('record created::::');
	console.log(record);
	Contacts.sync(record,function() {
		getRecords();
		$j.mobile.loading("hide");
        $j.mobile.changePage( "#mainpage" , { reverse: false, changeHash: true } );
	});
}

// Ugh - this is required to change text on a jQuery Mobile button
// due to the way it futzes with things at runtime
function setButtonText(id, str) {
    $j(id).html(str).parent().find('.ui-btn-text').text(str);
}