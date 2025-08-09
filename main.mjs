// Write the code which outputs prime numbers in the interval from 2 to n.
// For n = 10 the result will be 2,3,5,7.

const formElement = document.getElementById('form');
const inputElement = document.getElementById('form-input');
const mainElement = document.getElementById('content');
const inputElementMaxlength = inputElement.dataset.maxlength;
const outputElement = document.getElementById('prime-output');

/**
 * Return the calculated height of an elements
 * clone if height were set to auto and width set to 100%.
 * @param {HTMLElement} element
 */
function getFinalSize(element, textContent) {
    const clonedElement = element.cloneNode(true);
    clonedElement.textContent = textContent;
    clonedElement.classList.remove('prime-output--hidden');

    // What are the accessibility implications of this?
    // Well it is invisible, so probably none.
    clonedElement.style.cssText = 'position:static;top:0;left:0;overflow:auto;visibility:hidden;pointer-events:none;width:fit-content;min-width:unset;max-width:unset;height:fit-content;min-height:unset;max-height:unset;'

    mainElement.append(clonedElement);

    const rect = clonedElement.getBoundingClientRect();

    clonedElement.remove();

    return [rect.width, rect.height];
};

formElement.addEventListener('submit', (event) => {
    // Don't submit a get request.
    event.preventDefault();

    const upperBoundary = Number(inputElement.value);
    const primes = [];

    // No input provided
    if (!upperBoundary) {
        outputElement.classList.add('prime-output--hidden');
        return;
    }

    // User tampered with HTML controls:
    if (upperBoundary < 1)
        throw new Error("input value must be greater than 1.")
    if (upperBoundary > 1000)
        throw new Error("input value must be less than 1000.")

    // Iterate over the range of 2 - upperBoundary
    outer: for (let primeToCheck = 2; primeToCheck <= upperBoundary; primeToCheck++) {
        // Count up from 2 to the current number in the interval
        for (let smallerNumber = 2; smallerNumber < primeToCheck; smallerNumber++) {
            if (primeToCheck % smallerNumber === 0) {
                // Something could divide into the prime. Skip to next num in the interval
                continue outer;
            }
        }

        primes.push(primeToCheck)
    }

    const newPrimeString = primes.join(', ');
    const oldPrimeString = outputElement.textContent;
    let fadeOutSpanElement;

    // Check that we had non-empty output
    if (oldPrimeString) {
        const removedText = oldPrimeString.substring(newPrimeString.length);
        fadeOutSpanElement = document.createElement('span');
        fadeOutSpanElement.textContent = removedText;
        fadeOutSpanElement.classList.add('fadeout', 'inline');
        fadeOutSpanElement.addEventListener('animationend', (event) => {
            event.target.remove(); // garbage collect
        })
    }

    // flicker issue
    // issue with fadeOutSpanElement's position...

    // Obtain dimensions with new prime string
    const [width, height] = getFinalSize(outputElement, newPrimeString);

    outputElement.textContent = ''; // Replace HTML contents
    const newOutputText = document.createElement('span');
    newOutputText.textContent = newPrimeString;
    newOutputText.classList.add('inline');
    outputElement.append(newOutputText, fadeOutSpanElement ?? '')

    // Show output if it's hidden (if there was previously no input provided)
    outputElement.classList.remove('prime-output--hidden');

    // Trigger height animation to accomodate text
    outputElement.style.height = `${height}px`;
    outputElement.style.width = `${width}px`;
});

// Generate primes from 2 up to the interval's upper boundary.
inputElement.addEventListener('input', (event) => {
    // Enforce a maxlength
    const inputStringValue = String(event.target.value);
    if (inputStringValue.length > inputElementMaxlength) {
        // Update control's value to limit its character length
        event.target.value = inputStringValue.slice(0, inputElementMaxlength);
    }

    // Attempt a submission (will trigger browser data validation [min/max])
    // Will fail if input is larger or lower than input constraints
    formElement.requestSubmit();
});