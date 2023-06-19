export const consoleEnabled: boolean = true;

// Console.log Formatting 
// https://www.samanthaming.com/tidbits/40-colorful-console-message/

// Output to console as JSON Formatted String
export const formatOutput = function(output: any) : void {
    console.log(JSON.stringify(output, null, 4));
 }

 // Show console test as green
export function formateConsoleLog(value: string) {
    if (consoleEnabled) {
        console.log('\x1b[32m%s\x1b[0m', value); 
    }
}

 // Show console test as green
 export function logToConsole(value: string) {
    if (consoleEnabled) {
        console.log(value); 
    }
}
