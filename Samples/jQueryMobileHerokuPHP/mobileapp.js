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

function errorCallback(jqXHR){
    console.log(jqXHR.statusText + ": " + jqXHR.responseText);
}

function addClickListeners() {
    $j('#newbtn').click(function(e) {
        // Show the 'New Account' form
        e.preventDefault();
        $j('#form')[0].reset();
        $j('#formheader').html('New Contact');
        setButtonText('#actionbtn', 'Create');
        $j('#actionbtn').unbind('click.btn').bind('click.btn', createHandler);
        $j.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
    });

    $j('#deletebtn').click(function(e) {
        // Delete the account
        e.preventDefault();
        $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
        client.del('Contact', $j('#detail').find('#Id').val()
        ,
        function(response) {
            getRecords(function() {
                $j.mobile.loading( "hide");
                $j.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
            });
        }, errorCallback);
    });

    $j('#editbtn').click(function(e) {
        // Get account fields and show the 'Edit Account' form
        e.preventDefault();
        $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
        client.retrieve("Contact", $j('#detail').find('#Id').val()
        , "Name,FirstName,LastName,Id,Email",
        function(response) {
            $j('#form').find('input').each(function() {
                $j(this).val(response[$j(this).attr("name")]);
            });
            $j('#formheader').html('Edit Contact');
            setButtonText('#actionbtn', 'Update');
            $j('#actionbtn')
            .unbind('click.btn')
            .bind('click.btn', updateHandler);
            $j.mobile.loading( "hide");
            $j.mobile.changePage( "#editpage" , { reverse: false, changeHash: false } );
        }, errorCallback);
    });
}

// Populate the list and set up click handling
function getRecords(callback) {
	console.log('In getRecords');
    $j('#list').empty();
    client.query("SELECT Id, Name, FirstName, LastName FROM Contact ORDER BY Name LIMIT 20"
    ,
    function(response) {
		console.log('recieved'+response.records);
        $j.each(response.records,
        function() {
            var id = this.Id;
            $j('<li></li>')
            .hide()
            .append('<a><h2>' + this.Name + '</h2></a>')
            .click(function(e) {
                e.preventDefault();
                $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
                client.retrieve("Contact", id, "Name,FirstName,LastName,Id,Email"
                ,
                function(response) {
                    $j('#Name').html(response.Name);
					$j('#FirstName').html(response.FirstName);
					$j('#LastName').html(response.LastName);
                    $j('#Email').html(response.Email);
                    $j('#Id').val(response.Id);
                    $j.mobile.loading("hide");
                    $j.mobile.changePage( "#detailpage" , { reverse: false, changeHash: true } );
                }, errorCallback);
            })
            .appendTo('#list')
            .show();
        });

        $j('#list').listview('refresh');

        if (typeof callback != 'undefined' && callback != null) {
            callback();
        }
    }, errorCallback);
}

// Gather fields from the account form and create a record
function createHandler(e) {
    e.preventDefault();
    var form = $j('#form');
    var fields = {};
    form.find('input').each(function() {
        var child = $j(this);
        if (child.val().length > 0 && child.attr("name") != 'Id') {
            fields[child.attr("name")] = child.val();
        }
    });
    $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
    client.create('Contact', fields,
    function(response) {
        getRecords(function() {
            $j.mobile.loading( "hide" );
            $j.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
        });
    }, errorCallback);
}

// Gather fields from the account form and update a record
function updateHandler(e) {
    e.preventDefault();
    var form = $j('#form');
    var fields = {};
    form.find('input').each(function() {
        var child = $j(this);
        if (child.val().length > 0 && child.attr("name") != 'Id') {
            fields[child.attr("name")] = child.val();
        }
    });
    $j.mobile.loading( "show", { text: 'Loading', textVisible: true } );
    client.update('Contact', form.find('#Id').val(), fields
    ,
    function(response) {
        getRecords(function() {
            $j.mobile.loading( "hide");
            $j.mobile.changePage( "#mainpage" , { reverse: false, changeHash: false } );
        });
    }, errorCallback);
}

// Ugh - this is required to change text on a jQuery Mobile button
// due to the way it futzes with things at runtime
function setButtonText(id, str) {
    $j(id).html(str).parent().find('.ui-btn-text').text(str);
}
