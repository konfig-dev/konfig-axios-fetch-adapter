"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const __1 = __importDefault(require(".."));
window["axios"] = axios_1.default;
window.onload = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield axios_1.default.request({
                url: "/package.json",
                method: "get",
                adapter: __1.default,
            });
            (_a = document.getElementById("app")) === null || _a === void 0 ? void 0 : _a.append(JSON.stringify(data, null, 4));
        }
        catch (e) {
            console.log(e);
        }
    });
};
const formElem = document.getElementById("formElem");
if (formElem && formElem instanceof HTMLFormElement) {
    formElem.onsubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        let response = yield axios_1.default.request({
            url: "https://httpbin.org/post",
            method: "post",
            data: new FormData(formElem),
            adapter: __1.default,
        });
        console.log(response);
    });
}
