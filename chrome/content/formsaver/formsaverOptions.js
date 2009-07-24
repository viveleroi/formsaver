//*************************************************
//* FormSaver was designed for Mozilla Firefox
//*  by Michael Botsko, www.botsko.net
//*  ported to Firefox 3.0 by stanley.chow@pobox.com
//*************************************************

function savePrefs(){

  // We need to save any preferences set from the options window
  
  // Activate the preferences service
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);

  // Gather the values of any prefs set
  var passwordCheckBox          = document.getElementById("save-password").checked;
  var saveHiddenFieldsCheckBox  = document.getElementById("save-hidden").checked;
  var ignoreBlankCheckBox       = document.getElementById("ignore-blank").checked;
  var ignoreErrorsCheckBox      = document.getElementById("ignore-errors").checked;
  var checklocationsCheckBox    = document.getElementById("check-locations").checked;
  
  // Save 'em danno
  prefs.setBoolPref("formsaver.savepassword", passwordCheckBox);
  prefs.setBoolPref("formsaver.savehiddenfields", saveHiddenFieldsCheckBox);
  prefs.setBoolPref("formsaver.ignoreblankfields", ignoreBlankCheckBox);
  prefs.setBoolPref("formsaver.ignorerrors", ignoreErrorsCheckBox);
  prefs.setBoolPref("formsaver.checklocationhref", checklocationsCheckBox);

}

function onLoadFormsaver(){

  // We need to load any prefs already set - this executes when the user loads
  // the options form.

  // Connect to the prefs service
  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
  		.getService(Components.interfaces.nsIPrefBranch);
                
  // Check if "save password fields" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.savepassword") == prefs.PREF_BOOL){
    document.getElementById("save-password").checked = prefs.getBoolPref("formsaver.savepassword");
  }
  
  // Check if "save hidden fields" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.savehiddenfields") == prefs.PREF_BOOL){
    document.getElementById("save-hidden").checked = prefs.getBoolPref("formsaver.savehiddenfields");
  }
  
  // Check if "ignore blank fields" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.ignoreblankfields") == prefs.PREF_BOOL){
    document.getElementById("ignore-blank").checked = prefs.getBoolPref("formsaver.ignoreblankfields");
  }
  
  // Check if "check location href" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.checklocationhref") == prefs.PREF_BOOL){
    document.getElementById("check-locations").checked = prefs.getBoolPref("formsaver.checklocationhref");
  }
  
  // Check if "ignore errors" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.ignorerrors") == prefs.PREF_BOOL){
    document.getElementById("ignore-errors").checked = prefs.getBoolPref("formsaver.ignorerrors");
  }
  
  // get the bookmark name
  document.getElementById("bookmarklet-name").value = window.arguments[0].title + " - FormSaved";


  var folderId = null;
  // Check if "sent to folder id" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.sendtoFolderId") == prefs.PREF_INT) {
    folderId = prefs.getIntPref("formsaver.sendtoFolderId");
  } else {
    // initialize the folderId to the toolbar 
    var bmarks = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                         .getService(Components.interfaces.nsINavBookmarksService);
    folderId = bmarks.toolbarFolder;
  }

  try {
    // set up the bookmark tree
	var bmFolders = 'place:queryType=1&folder=' + PlacesUIUtils.allBookmarksFolderId + '&excludeItems=true'
    document.getElementById('bookmarkView').place = bmFolders;
  } catch(e) {
    //******
    //****** this causes some exception, 
    //****** I have no idea why (bookmark-tree code fragment from Dietrich Ayala)
    //******
  }
  // select the folder in the bookmark tree
  document.getElementById('bookmarkView').selectItems([folderId]);
}


// When the user selects a bookmark folder, this function will:
//  1) find which folder is selected
//  2) turn it into an bookmark folderId (which is needed for creating the bookmark)
//  3) save the folderId (which happens to be an Int) into prefs
function onSelectBookmarkFolder(tree) {
  var selected = tree.selectedNode;
  if (selected == null)
    return;
  var folderId = PlacesUtils.getConcreteItemId(selected);
  // Connect to the prefs service
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
  prefs.setIntPref("formsaver.sendtoFolderId", folderId);
}


// Alert the user to password security issues if they
// choose to save the password
function passwordWarnings(){

  // Connect to the prefs service
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);

  // Check if we've shown the user this before, disable if we have
  if (prefs.getPrefType("formsaver.ireadthewarningalready") == prefs.PREF_BOOL){
    var ireadthewarningalready = prefs.getBoolPref("formsaver.ireadthewarningalready");
  }
  
  if(!document.getElementById("save-password").checked && !ireadthewarningalready){
    alert("Because FormSaver stores field values in plain text, we do not advise storing any personal/private passwords. Saving password field data is recommended for form development only. For more information visit http://www.botsko.net/Website/firefox");
  }
    
    // we gave them the message, now hide it forever
    prefs.setBoolPref("formsaver.ireadthewarningalready", true);

}
