# El.js

[![npm][npm-img]][npm-url]
[![build][build-img]][build-url]
[![dependencies][dependencies-img]][dependencies-url]
[![downloads][downloads-img]][downloads-url]
[![license][license-img]][license-url]
[![chat][chat-img]][chat-url]

> A reasonable micro-app framework with practical reuseability.

-----

# Introduction

El.js is a framework built ontop of [Riot.js](http://www.riotjs.com) templates for building micro-apps.

## What is a *micro-app*?

Web-frameworks require developers to build most if not all their webpages to be dynamic webapps.  This allows developers to make sure everything on their webpage obeys a single consistent, predictable, rendering flow that they can reason about.  However, there are also many disadvantages compared to traditional static websites including more complex caching schemes, longer load-times, and SEO problems.  Microapps offer a powerful solution for these drawbacks.  Instead of building giant monolithic web applications, build small apps and embed them on your otherwise static pages.

A micro-app performs a small and very tightly scoped piece of functionality that can be reused over and over again. Micro-apps don't differ much from the idea of embeddable widgets before frameworks became the standard, but they differ in execution by emphasizing a reliance on reasonable frameworks and practical reuseability.

## A Simple Form Example

HTML: index.html
```html
<html>
	<head>
	<!-- Head Content -->
	<link rel="stylesheet" src="https://cdn.jsdelivr.net/gh/hanzo-io/el-controls/theme.css" />
	</head>
	<body>
		<my-form>
			<div>
				<label>Type Your Name</label>
				<!-- bind my-input to parent(my-form).data.name, parent.data is implicit for what is supplied to bind attribute -->
				<my-input bind='name' />
			</div>
			<div>
				<span>Your Name Is</span>
				<span>{ data.name }</span>
			</div
		</my-form>
		<!-- El.js Library -->
		<script src="https://cdn.jsdelivr.net/gh/hanzo-io/el.js/el.min.js"></script>
		<script src="my-script.js"></script>
	</body>
</html>
```

JS: my-script.js
```javascript
// window.El is the global value

// El.Form extends El.View and validates bound El.Inputs
class Form extends El.Form {
	constuctor () {
		// data contains your state
		this.data = { 
			name: '?', 
		}
		// your custom tag name
		this.tag = 'my-form'

		super()
	}
}

Form.register()

// El.Input extends El.View and binds to updating El.Form values
class Input extends El.Input {
	constructor () {
		// your custom tag name
		this.tag = 'my-input'
		// the default this.change function works with all basic html inputs(<input>, <textarea>, ...).
		this.html = '<input onkeydown="{ change }" />'

		super()
	}
}

Input.register()

El.mount('*')
```

## Installation

### HTML

Add this tag to the bottom of <body> before your custom scripts and deps and reference window.El.
```html
<script src="https://cdn.jsdelivr.net/gh/hanzo-io/el.js/el.min.js"></script>
```

### Node:

Install via NPM
```javascript
npm install el.js --save
```

Supports CommonJS
```javascript
var El = require 'el.js'
```

or ES6 imports
```javascript
import El from 'el.js'
```

# API

## Types

### InputType 

This type is referenced by _El.Form_ to store the information used to validate the field associated with _name_.

#### Properties
| Name | Type |  Default | Description |
| --- | --- | --- | --- |
| config | _MiddlewareFunction_ or [_MiddlewareFunction_] | undefined | This type stores the original _MiddlewareFunction_ or _MiddlewareFunctions_ used to create _validate()_ |
| name | string | '' | This is the name of a field on _El.Form_'s _data_ property that the rest of this type references. |
| ref | [Referrential Tree](https://github.com/zeekay/referential) | undefined | This is a link to the mutable data tree which can retrieve the value of _name_ by calling this.ref.get(_name_) |

#### Methods

| Name | Type | Description |
| --- | --- | --- |
| validate | ([Referrential Tree](https://github.com/zeekay/referential), string) => Promise |This method calls all the _MiddlwareFunctions_ in serial using promises. |

### MiddlewareFunction
* type: (value: any) => Promise or any

This type is used for defining middleware for _El.Form_.  Do validation and input sanitization with these functions such as:

```javascript
function isRequired(value) {
  value = value.trim()
  if (value && value != '') {
    return value
  }
  
  throw new Error('Required')
}
```
#### PromiseReference 
* type: { p: Promise }

This type is used internally in places to facilitate returning promises by reference.

## Classes

### El.View
This is the base class for all El classes.  Each _El.View_ corresponds with a custom tag.  Extend this class to make your own custom tags.

#### Properties

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| css | string | '' | This is a string representing the tag's css. It is injected once per class at the bottom of the <head> tag when mounted. |
| data | [Referrential Tree](https://github.com/zeekay/referential) | undefined | This property stores the state of the tag. |
| html | string | '' | This is a string representing the tag's inner html. |
| root | HTMLElement | undefined | This property stores a reference to the tag in your webpage that the mounted view is bound to. |
| tag | string | '' | This is the custom tag name. |

#### Methods

| Name | Type | Description |
| --- | --- | --- |
| beforeInit | () => | The code here executes before the tag is initialized. |
| init | () => | The code here executes when tag is initialized but before its mounted.  __Recommended__ - If you need to bind to the [tag's lifecycle](http://riotjs.com/api/#events), do it here. |
| scheduleUpdate | () => Promise | This method schedules an asynchronous update call. It batches update calls at the top-most view if there are nested views. It returns a promise for when the update executes |
| update | () => | This method updates the tag. This is called implicitly after events triggered from webpage. See onkeydown in A 'Simple Form Example' for such a case. Manually call this method to update the tag. __Recommended__ - It is recommended to manually call _scheduleUpdate()_ instead to prevent synchronous update cascades. |

#### Methods Inherited from Riot Observable (on, one, off, trigger)
Each _El.View_ is an event emitter.  See riot.observable for further documentation, http://riotjs.com/api/observable/

#### Static Methods

| Name | Type | Description |
| --- | --- | --- |
| El.View.register | () => | This registers the current custom tag with the rendering engine. Call it after you defined a tag |

### El.Form extends El.View
This class is used to represent forms as well as more complex IO driven micro-apps.  This class supplies common form validation and form submit logic.

#### Properties

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| configs | Object | undefined | Supply a map of names to a _MiddlewareFunction_ or array of _MiddlewareFunctions_. See _MiddlewareFunction_ for more information. |
| inputs | Object | null | Each element in _configs_ is converted to an element in _inputs_.  Modifying this directly is not recommended. |

#### Methods
| Name | Type | Description |
| --- | --- | --- |
| init | () => | Code here executes when tag is initialized but before its mounted.  Calls _initInputs()_ so manually call that - or call super() in ES6. __Recommended__ - If you need to bind to the [tag's lifecycle](http://riotjs.com/api/#events), do it here. |
| initInputs | () => |Compile _configs_ and assign the emitted struct to _inputs_.  _inputs_ like _configs_ contain references to the named field in _data_. |
| submit | (Event) => Promise | This method triggers validation for each field in _data_ as defined in _configs_.  This method should be called as an event handler/listener.  It calls _submit()_ if validation is successful, returns a promise for when validation succeeds/fails |
| \_submit | () => | Code here executes when the form is validated during _submit()_ call |

### El.Input extends El.View
This is the base class for building form inputs and IO controls.

#### Properties

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| bind | string | '' | This property determines which field in the parent form's _data_ this binds to. |
| lookup | string | '' | Same as _bind_, __deprecated__. |
| errorMessage | string | '' | This property is set to the first error message that this.input.validate's returned promise catches. |
| input | _InputType_ | null | This property is taken from the parent form's _inputs_ property based on what parent _data_'s field _bind_ specifies. |
| valid | bool | false | This property is used to determine the validation state the input is in.  It is set when this.input.validate is called, it is only ever set to true if this.input.validate's returned promise executes completely. |

#### Methods
| Name | Type | Description |
| --- | --- | --- |
| change | (Event) => | This method updates the input and then validates it.  This method should be called by an event handler/listener. |
| changed | () => | This method is called when this.input.validate's returned promise executes completely. |
| clearError | () => | This method sets _errorMessage_ to '' and is called before validation. |
| error | (Error) => | This method sets _errorMessage_ and is called when validation fails. |
| getValue | (Event) => any | This method gets the value from the input. By default, this method returns the _Event_'s target.value. |
| validate | (PromiseReference?) => Promise | This method validates the input, it returns a Promise representing validation success and fail both by reference (needed internally) and by value. |

## Functions

| Name | Type | Description |
| --- | --- | --- |
| El.scheduleUpdate | () => | Schedule update for all micro-apps on the page. |

### Inherited from Riot (El.mount, El.update, etc)
El.js's life cycle functions are inherited from [Riot.js](http://riotjs.com/api/).

## Default Obserable Mutable Tree
El.js uses [Referrential Trees](https://github.com/zeekay/referential) to store its form data.

### (BYODS) Bring Your Own Data Structure
Implement the get, set, on, once, off methods from referrential around your own datastructure and drop it in as the data property.

# Best Practices

## Use Containers and Controls

A *container* is a custom tag that provides methods to use for its internal template and whose content can be overwritten entirely (only contains content in one or more <yield/> tags).  A *control* is a component which interacts with the user for the purposes of displaying information in an interesting way or getting input such as an input, select, or a GoogleMaps embed.

Instead of building widgets in a tightly coupled fashion, decompose the widget into a containers and controls to maximize reuseability.  Structure the internal html in whatever way makes the most sense.  Then, release your completed widget, container, and controls to your users so they can customize the widget for their various requirements.

By abstracting your ui elements like this, it is much easier for someone else to reuse and customize your code.  See [shop.js](https://github.com/hanzo-io/shop.js) for an implementation.

## Use a Single State Store

It is best to use a single high level state store to simplify saving and restoring state for your webpage or entire website.

This can be acomplished by supplying all top level containers on the page the same _data_ field. via the initial mount call
```javascript
var data = {
	state0: 0,
	state1: 1,
}

El.mount('*', { data: data })
```

# Advanced Usage

## Nested Protypical Inheritence

Unlike normal Riot rendering, El.js allows the implicit accessing of values on this.parent and this.parent...parent via prototypical inheritence of the rendering context. This is done to avoid repeatedly passing the same data down through nested containers because it is error prone and overly verbose.  This also makes it easier to build containers and controls.

Explicitly passing the data variable:
```html
<my-container-1>
	<my-container-2 data='{ data }'>
		<my-container-3 data='{ data }'>
			value: { data.value1 }
		</my-container-3>
		<my-container-3 data='{ data }'>
			value: { data.value2 }
		</my-container-3>
	</my-container-2>
	<my-container-2 data='{ data }'>
		<my-container-3 data='{ data }'>
			value: { data.value3 }
		</my-container-3>
		<my-container-3 data='{ data }'>
			value: { data.value4 }
		</my-container-3>
	</my-container-2>
</my-container-1>
```

```javascript
// El.mount passes data to the top level container of each micro-app
El.mount('*', data: { value1: 1, value2: 2, value3: 3, value4: 4 } )
```

Is equivalent to implicitly referencing the data variable.

```html
<my-container-1>
	<my-container-2>
		<my-container-3>
			value: { data.value1 }
		</my-container-3>
		<my-container-3>
			value: { data.value2 }
		</my-container-3>
	</my-container-2>
	<my-container-2>
		<my-container-3>
			value: { data.value3 }
		</my-container-3>
		<my-container-3>
			value: { data.value4 }
		</my-container-3>
	</my-container-2>
</my-container-1>
```

```javascript
// El.mount passes data to the top level container of each micro-app
El.mount('*', data: { value1: 1, value2: 2, value3: 3, value4: 4 } )
```
## License
[BSD][license-url]

[examples]:         https://github.com/hanzo-io/el.js/blob/master/test/test.coffee

[build-img]:        https://img.shields.io/travis/hanzo-io/el.js.svg
[build-url]:        https://travis-ci.org/hanzo-io/el.js
[chat-img]:         https://badges.gitter.im/join-chat.svg
[chat-url]:         https://gitter.im/hanzo-io/chat
[coverage-img]:     https://coveralls.io/repos/hanzo-io/el.js/badge.svg?branch=master&service=github
[coverage-url]:     https://coveralls.io/github/hanzo-io/el.js?branch=master
[dependencies-img]: https://david-dm.org/hanzo-io/el.js.svg
[dependencies-url]: https://david-dm.org/hanzo-io/el.js
[downloads-img]:    https://img.shields.io/npm/dm/el.js.svg
[downloads-url]:    http://badge.fury.io/js/el.js
[license-img]:      https://img.shields.io/npm/l/el.js.svg
[license-url]:      https://github.com/hanzo-io/el.js/blob/master/LICENSE
[npm-img]:          https://img.shields.io/npm/v/el.js.svg
[npm-url]:          https://www.npmjs.com/package/el.js
