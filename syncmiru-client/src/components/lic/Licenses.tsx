import {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {createLocaleComparator} from "src/utils/sort.ts";

export default function Licenses(): ReactElement {
    const {t} = useTranslation()
    const localeComparator = createLocaleComparator(t)

    const licenses: Array<License> = [
        {
            name: 'MIT License',
            text: "Copyright <YEAR> <COPYRIGHT HOLDER>\n" +
                "\n" +
                "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n" +
                "\n" +
                "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n" +
                "\n" +
                "THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n"
        },
        {
            name: "The Unlicense License",
            text: "This is free and unencumbered software released into the public domain.\n" +
                "\n" +
                "Anyone is free to copy, modify, publish, use, compile, sell, or\n" +
                "distribute this software, either in source code form or as a compiled\n" +
                "binary, for any purpose, commercial or non-commercial, and by any\n" +
                "means.\n" +
                "\n" +
                "In jurisdictions that recognize copyright laws, the author or authors\n" +
                "of this software dedicate any and all copyright interest in the\n" +
                "software to the public domain. We make this dedication for the benefit\n" +
                "of the public at large and to the detriment of our heirs and\n" +
                "successors. We intend this dedication to be an overt act of\n" +
                "relinquishment in perpetuity of all present and future rights to this\n" +
                "software under copyright law.\n" +
                "\n" +
                "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\n" +
                "EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n" +
                "MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n" +
                "IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR\n" +
                "OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,\n" +
                "ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR\n" +
                "OTHER DEALINGS IN THE SOFTWARE.\n" +
                "\n" +
                "For more information, please refer to <https://unlicense.org>"
        },
        {
            name: "Apache License Version 2.0, January 2004 <http://www.apache.org/licenses/>",
            text: "TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION\n" +
                "\n" +
                "1. Definitions.\n" +
                "\n" +
                "\"License\" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.\n" +
                "\n" +
                "\"Licensor\" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.\n" +
                "\n" +
                "\"Legal Entity\" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, \"control\" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.\n" +
                "\n" +
                "\"You\" (or \"Your\") shall mean an individual or Legal Entity exercising permissions granted by this License.\n" +
                "\n" +
                "\"Source\" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.\n" +
                "\n" +
                "\"Object\" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.\n" +
                "\n" +
                "\"Work\" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).\n" +
                "\n" +
                "\"Derivative Works\" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.\n" +
                "\n" +
                "\"Contribution\" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, \"submitted\" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as \"Not a Contribution.\"\n" +
                "\n" +
                "\"Contributor\" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.\n" +
                "\n" +
                "2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.\n" +
                "\n" +
                "3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.\n" +
                "\n" +
                "4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:\n" +
                "\n" +
                "    You must give any other recipients of the Work or Derivative Works a copy of this License; and\n" +
                "    You must cause any modified files to carry prominent notices stating that You changed the files; and\n" +
                "    You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and\n" +
                "    If the Work includes a \"NOTICE\" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License.\n" +
                "\n" +
                "You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.\n" +
                "\n" +
                "5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.\n" +
                "\n" +
                "6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.\n" +
                "\n" +
                "7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.\n" +
                "\n" +
                "8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.\n" +
                "\n" +
                "9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.\n" +
                "\n" +
                "END OF TERMS AND CONDITIONS"
        },
        {
            name: "3-Clause BSD License",
            text: "Copyright <YEAR> <COPYRIGHT HOLDER>\n" +
                "\n" +
                "Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n" +
                "\n" +
                "1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n" +
                "\n" +
                "2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n" +
                "\n" +
                "3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n" +
                "\n" +
                "THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
        },
        {
            name: "MPL-2.0 License",
            text: "\n" +
                "Mozilla Public License\n" +
                "Version 2.0\n" +
                "1. Definitions\n" +
                "\n" +
                "1.1. “Contributor”\n" +
                "\n" +
                "    means each individual or legal entity that creates, contributes to the creation of, or owns Covered Software.\n" +
                "1.2. “Contributor Version”\n" +
                "\n" +
                "    means the combination of the Contributions of others (if any) used by a Contributor and that particular Contributor’s Contribution.\n" +
                "1.3. “Contribution”\n" +
                "\n" +
                "    means Covered Software of a particular Contributor.\n" +
                "1.4. “Covered Software”\n" +
                "\n" +
                "    means Source Code Form to which the initial Contributor has attached the notice in Exhibit A, the Executable Form of such Source Code Form, and Modifications of such Source Code Form, in each case including portions thereof.\n" +
                "1.5. “Incompatible With Secondary Licenses”\n" +
                "\n" +
                "    means\n" +
                "\n" +
                "        that the initial Contributor has attached the notice described in Exhibit B to the Covered Software; or\n" +
                "\n" +
                "        that the Covered Software was made available under the terms of version 1.1 or earlier of the License, but not also under the terms of a Secondary License.\n" +
                "\n" +
                "1.6. “Executable Form”\n" +
                "\n" +
                "    means any form of the work other than Source Code Form.\n" +
                "1.7. “Larger Work”\n" +
                "\n" +
                "    means a work that combines Covered Software with other material, in a separate file or files, that is not Covered Software.\n" +
                "1.8. “License”\n" +
                "\n" +
                "    means this document.\n" +
                "1.9. “Licensable”\n" +
                "\n" +
                "    means having the right to grant, to the maximum extent possible, whether at the time of the initial grant or subsequently, any and all of the rights conveyed by this License.\n" +
                "1.10. “Modifications”\n" +
                "\n" +
                "    means any of the following:\n" +
                "\n" +
                "        any file in Source Code Form that results from an addition to, deletion from, or modification of the contents of Covered Software; or\n" +
                "\n" +
                "        any new file in Source Code Form that contains any Covered Software.\n" +
                "\n" +
                "1.11. “Patent Claims” of a Contributor\n" +
                "\n" +
                "    means any patent claim(s), including without limitation, method, process, and apparatus claims, in any patent Licensable by such Contributor that would be infringed, but for the grant of the License, by the making, using, selling, offering for sale, having made, import, or transfer of either its Contributions or its Contributor Version.\n" +
                "1.12. “Secondary License”\n" +
                "\n" +
                "    means either the GNU General Public License, Version 2.0, the GNU Lesser General Public License, Version 2.1, the GNU Affero General Public License, Version 3.0, or any later versions of those licenses.\n" +
                "1.13. “Source Code Form”\n" +
                "\n" +
                "    means the form of the work preferred for making modifications.\n" +
                "1.14. “You” (or “Your”)\n" +
                "\n" +
                "    means an individual or a legal entity exercising rights under this License. For legal entities, “You” includes any entity that controls, is controlled by, or is under common control with You. For purposes of this definition, “control” means (a) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (b) ownership of more than fifty percent (50%) of the outstanding shares or beneficial ownership of such entity.\n" +
                "\n" +
                "2. License Grants and Conditions\n" +
                "2.1. Grants\n" +
                "\n" +
                "Each Contributor hereby grants You a world-wide, royalty-free, non-exclusive license:\n" +
                "\n" +
                "    under intellectual property rights (other than patent or trademark) Licensable by such Contributor to use, reproduce, make available, modify, display, perform, distribute, and otherwise exploit its Contributions, either on an unmodified basis, with Modifications, or as part of a Larger Work; and\n" +
                "\n" +
                "    under Patent Claims of such Contributor to make, use, sell, offer for sale, have made, import, and otherwise transfer either its Contributions or its Contributor Version.\n" +
                "\n" +
                "2.2. Effective Date\n" +
                "\n" +
                "The licenses granted in Section 2.1 with respect to any Contribution become effective for each Contribution on the date the Contributor first distributes such Contribution.\n" +
                "2.3. Limitations on Grant Scope\n" +
                "\n" +
                "The licenses granted in this Section 2 are the only rights granted under this License. No additional rights or licenses will be implied from the distribution or licensing of Covered Software under this License. Notwithstanding Section 2.1(b) above, no patent license is granted by a Contributor:\n" +
                "\n" +
                "    for any code that a Contributor has removed from Covered Software; or\n" +
                "\n" +
                "    for infringements caused by: (i) Your and any other third party’s modifications of Covered Software, or (ii) the combination of its Contributions with other software (except as part of its Contributor Version); or\n" +
                "\n" +
                "    under Patent Claims infringed by Covered Software in the absence of its Contributions.\n" +
                "\n" +
                "This License does not grant any rights in the trademarks, service marks, or logos of any Contributor (except as may be necessary to comply with the notice requirements in Section 3.4).\n" +
                "2.4. Subsequent Licenses\n" +
                "\n" +
                "No Contributor makes additional grants as a result of Your choice to distribute the Covered Software under a subsequent version of this License (see Section 10.2) or under the terms of a Secondary License (if permitted under the terms of Section 3.3).\n" +
                "2.5. Representation\n" +
                "\n" +
                "Each Contributor represents that the Contributor believes its Contributions are its original creation(s) or it has sufficient rights to grant the rights to its Contributions conveyed by this License.\n" +
                "2.6. Fair Use\n" +
                "\n" +
                "This License is not intended to limit any rights You have under applicable copyright doctrines of fair use, fair dealing, or other equivalents.\n" +
                "2.7. Conditions\n" +
                "\n" +
                "Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted in Section 2.1.\n" +
                "3. Responsibilities\n" +
                "3.1. Distribution of Source Form\n" +
                "\n" +
                "All distribution of Covered Software in Source Code Form, including any Modifications that You create or to which You contribute, must be under the terms of this License. You must inform recipients that the Source Code Form of the Covered Software is governed by the terms of this License, and how they can obtain a copy of this License. You may not attempt to alter or restrict the recipients’ rights in the Source Code Form.\n" +
                "3.2. Distribution of Executable Form\n" +
                "\n" +
                "If You distribute Covered Software in Executable Form then:\n" +
                "\n" +
                "    such Covered Software must also be made available in Source Code Form, as described in Section 3.1, and You must inform recipients of the Executable Form how they can obtain a copy of such Source Code Form by reasonable means in a timely manner, at a charge no more than the cost of distribution to the recipient; and\n" +
                "\n" +
                "    You may distribute such Executable Form under the terms of this License, or sublicense it under different terms, provided that the license for the Executable Form does not attempt to limit or alter the recipients’ rights in the Source Code Form under this License.\n" +
                "\n" +
                "3.3. Distribution of a Larger Work\n" +
                "\n" +
                "You may create and distribute a Larger Work under terms of Your choice, provided that You also comply with the requirements of this License for the Covered Software. If the Larger Work is a combination of Covered Software with a work governed by one or more Secondary Licenses, and the Covered Software is not Incompatible With Secondary Licenses, this License permits You to additionally distribute such Covered Software under the terms of such Secondary License(s), so that the recipient of the Larger Work may, at their option, further distribute the Covered Software under the terms of either this License or such Secondary License(s).\n" +
                "3.4. Notices\n" +
                "\n" +
                "You may not remove or alter the substance of any license notices (including copyright notices, patent notices, disclaimers of warranty, or limitations of liability) contained within the Source Code Form of the Covered Software, except that You may alter any license notices to the extent required to remedy known factual inaccuracies.\n" +
                "3.5. Application of Additional Terms\n" +
                "\n" +
                "You may choose to offer, and to charge a fee for, warranty, support, indemnity or liability obligations to one or more recipients of Covered Software. However, You may do so only on Your own behalf, and not on behalf of any Contributor. You must make it absolutely clear that any such warranty, support, indemnity, or liability obligation is offered by You alone, and You hereby agree to indemnify every Contributor for any liability incurred by such Contributor as a result of warranty, support, indemnity or liability terms You offer. You may include additional disclaimers of warranty and limitations of liability specific to any jurisdiction.\n" +
                "4. Inability to Comply Due to Statute or Regulation\n" +
                "\n" +
                "If it is impossible for You to comply with any of the terms of this License with respect to some or all of the Covered Software due to statute, judicial order, or regulation then You must: (a) comply with the terms of this License to the maximum extent possible; and (b) describe the limitations and the code they affect. Such description must be placed in a text file included with all distributions of the Covered Software under this License. Except to the extent prohibited by statute or regulation, such description must be sufficiently detailed for a recipient of ordinary skill to be able to understand it.\n" +
                "5. Termination\n" +
                "\n" +
                "5.1. The rights granted under this License will terminate automatically if You fail to comply with any of its terms. However, if You become compliant, then the rights granted under this License from a particular Contributor are reinstated (a) provisionally, unless and until such Contributor explicitly and finally terminates Your grants, and (b) on an ongoing basis, if such Contributor fails to notify You of the non-compliance by some reasonable means prior to 60 days after You have come back into compliance. Moreover, Your grants from a particular Contributor are reinstated on an ongoing basis if such Contributor notifies You of the non-compliance by some reasonable means, this is the first time You have received notice of non-compliance with this License from such Contributor, and You become compliant prior to 30 days after Your receipt of the notice.\n" +
                "\n" +
                "5.2. If You initiate litigation against any entity by asserting a patent infringement claim (excluding declaratory judgment actions, counter-claims, and cross-claims) alleging that a Contributor Version directly or indirectly infringes any patent, then the rights granted to You by any and all Contributors for the Covered Software under Section 2.1 of this License shall terminate.\n" +
                "\n" +
                "5.3. In the event of termination under Sections 5.1 or 5.2 above, all end user license agreements (excluding distributors and resellers) which have been validly granted by You or Your distributors under this License prior to termination shall survive termination.\n" +
                "6. Disclaimer of Warranty\n" +
                "\n" +
                "Covered Software is provided under this License on an “as is” basis, without warranty of any kind, either expressed, implied, or statutory, including, without limitation, warranties that the Covered Software is free of defects, merchantable, fit for a particular purpose or non-infringing. The entire risk as to the quality and performance of the Covered Software is with You. Should any Covered Software prove defective in any respect, You (not any Contributor) assume the cost of any necessary servicing, repair, or correction. This disclaimer of warranty constitutes an essential part of this License. No use of any Covered Software is authorized under this License except under this disclaimer.\n" +
                "7. Limitation of Liability\n" +
                "\n" +
                "Under no circumstances and under no legal theory, whether tort (including negligence), contract, or otherwise, shall any Contributor, or anyone who distributes Covered Software as permitted above, be liable to You for any direct, indirect, special, incidental, or consequential damages of any character including, without limitation, damages for lost profits, loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses, even if such party shall have been informed of the possibility of such damages. This limitation of liability shall not apply to liability for death or personal injury resulting from such party’s negligence to the extent applicable law prohibits such limitation. Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so this exclusion and limitation may not apply to You.\n" +
                "8. Litigation\n" +
                "\n" +
                "Any litigation relating to this License may be brought only in the courts of a jurisdiction where the defendant maintains its principal place of business and such litigation shall be governed by laws of that jurisdiction, without reference to its conflict-of-law provisions. Nothing in this Section shall prevent a party’s ability to bring cross-claims or counter-claims.\n" +
                "9. Miscellaneous\n" +
                "\n" +
                "This License represents the complete agreement concerning the subject matter hereof. If any provision of this License is held to be unenforceable, such provision shall be reformed only to the extent necessary to make it enforceable. Any law or regulation which provides that the language of a contract shall be construed against the drafter shall not be used to construe this License against a Contributor.\n" +
                "10. Versions of the License\n" +
                "10.1. New Versions\n" +
                "\n" +
                "Mozilla Foundation is the license steward. Except as provided in Section 10.3, no one other than the license steward has the right to modify or publish new versions of this License. Each version will be given a distinguishing version number.\n" +
                "10.2. Effect of New Versions\n" +
                "\n" +
                "You may distribute the Covered Software under the terms of the version of the License under which You originally received the Covered Software, or under the terms of any subsequent version published by the license steward.\n" +
                "10.3. Modified Versions\n" +
                "\n" +
                "If you create software not governed by this License, and you want to create a new license for such software, you may create and use a modified version of this License if you rename the license and remove any references to the name of the license steward (except to note that such modified license differs from this License).\n" +
                "10.4. Distributing Source Code Form that is Incompatible With Secondary Licenses\n" +
                "\n" +
                "If You choose to distribute Source Code Form that is Incompatible With Secondary Licenses under the terms of this version of the License, the notice described in Exhibit B of this License must be attached.\n" +
                "Exhibit A - Source Code Form License Notice\n" +
                "\n" +
                "    This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.\n" +
                "\n" +
                "If it is not possible or desirable to put the notice in a particular file, then You may include the notice in a location (such as a LICENSE file in a relevant directory) where a recipient would be likely to look for such a notice.\n" +
                "\n" +
                "You may add additional accurate notices of copyright ownership.\n" +
                "Exhibit B - “Incompatible With Secondary Licenses” Notice\n" +
                "\n" +
                "    This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.\n" +
                "\n"
        },
        {
            name: "BSL-1.0",
            text: "Permission is hereby granted, free of charge, to any person or organization obtaining a copy of the software and accompanying documentation covered by this license (the “Software”) to use, reproduce, display, distribute, execute, and transmit the Software, and to prepare derivative works of the Software, and to permit third-parties to whom the Software is furnished to do so, all subject to the following:\n" +
                "\n" +
                "The copyright notices in the Software and this entire statement, including the above license grant, this restriction and the following disclaimer, must be included in all copies of the Software, in whole or in part, and all derivative works of the Software, unless such copies or derivative works are solely in the form of machine-executable object code generated by a source language processor.\n" +
                "\n" +
                "THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE."
        },
        {
            name: "CC Attribution License 4.0",
            text: "\n" +
                "Attribution 4.0 International\n" +
                "\n" +
                "By exercising the Licensed Rights (defined below), You accept and agree to be bound by the terms and conditions of this Creative Commons Attribution 4.0 International Public License (\"Public License\"). To the extent this Public License may be interpreted as a contract, You are granted the Licensed Rights in consideration of Your acceptance of these terms and conditions, and the Licensor grants You such rights in consideration of benefits the Licensor receives from making the Licensed Material available under these terms and conditions.\n" +
                "Section 1 – Definitions.\n" +
                "\n" +
                "    Adapted Material means material subject to Copyright and Similar Rights that is derived from or based upon the Licensed Material and in which the Licensed Material is translated, altered, arranged, transformed, or otherwise modified in a manner requiring permission under the Copyright and Similar Rights held by the Licensor. For purposes of this Public License, where the Licensed Material is a musical work, performance, or sound recording, Adapted Material is always produced where the Licensed Material is synched in timed relation with a moving image.\n" +
                "    Adapter's License means the license You apply to Your Copyright and Similar Rights in Your contributions to Adapted Material in accordance with the terms and conditions of this Public License.\n" +
                "    Copyright and Similar Rights means copyright and/or similar rights closely related to copyright including, without limitation, performance, broadcast, sound recording, and Sui Generis Database Rights, without regard to how the rights are labeled or categorized. For purposes of this Public License, the rights specified in Section 2(b)(1)-(2) are not Copyright and Similar Rights.\n" +
                "    Effective Technological Measures means those measures that, in the absence of proper authority, may not be circumvented under laws fulfilling obligations under Article 11 of the WIPO Copyright Treaty adopted on December 20, 1996, and/or similar international agreements.\n" +
                "    Exceptions and Limitations means fair use, fair dealing, and/or any other exception or limitation to Copyright and Similar Rights that applies to Your use of the Licensed Material.\n" +
                "    Licensed Material means the artistic or literary work, database, or other material to which the Licensor applied this Public License.\n" +
                "    Licensed Rights means the rights granted to You subject to the terms and conditions of this Public License, which are limited to all Copyright and Similar Rights that apply to Your use of the Licensed Material and that the Licensor has authority to license.\n" +
                "    Licensor means the individual(s) or entity(ies) granting rights under this Public License.\n" +
                "    Share means to provide material to the public by any means or process that requires permission under the Licensed Rights, such as reproduction, public display, public performance, distribution, dissemination, communication, or importation, and to make material available to the public including in ways that members of the public may access the material from a place and at a time individually chosen by them.\n" +
                "    Sui Generis Database Rights means rights other than copyright resulting from Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996 on the legal protection of databases, as amended and/or succeeded, as well as other essentially equivalent rights anywhere in the world.\n" +
                "    You means the individual or entity exercising the Licensed Rights under this Public License. Your has a corresponding meaning.\n" +
                "\n" +
                "Section 2 – Scope.\n" +
                "\n" +
                "    License grant .\n" +
                "        Subject to the terms and conditions of this Public License, the Licensor hereby grants You a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise the Licensed Rights in the Licensed Material to:\n" +
                "            reproduce and Share the Licensed Material, in whole or in part; and\n" +
                "            produce, reproduce, and Share Adapted Material.\n" +
                "        Exceptions and Limitations . For the avoidance of doubt, where Exceptions and Limitations apply to Your use, this Public License does not apply, and You do not need to comply with its terms and conditions.\n" +
                "        Term . The term of this Public License is specified in Section 6(a) .\n" +
                "        Media and formats; technical modifications allowed . The Licensor authorizes You to exercise the Licensed Rights in all media and formats whether now known or hereafter created, and to make technical modifications necessary to do so. The Licensor waives and/or agrees not to assert any right or authority to forbid You from making technical modifications necessary to exercise the Licensed Rights, including technical modifications necessary to circumvent Effective Technological Measures. For purposes of this Public License, simply making modifications authorized by this Section 2(a)(4) never produces Adapted Material.\n" +
                "        Downstream recipients .\n" +
                "            Offer from the Licensor – Licensed Material . Every recipient of the Licensed Material automatically receives an offer from the Licensor to exercise the Licensed Rights under the terms and conditions of this Public License.\n" +
                "            No downstream restrictions . You may not offer or impose any additional or different terms or conditions on, or apply any Effective Technological Measures to, the Licensed Material if doing so restricts exercise of the Licensed Rights by any recipient of the Licensed Material.\n" +
                "        No endorsement . Nothing in this Public License constitutes or may be construed as permission to assert or imply that You are, or that Your use of the Licensed Material is, connected with, or sponsored, endorsed, or granted official status by, the Licensor or others designated to receive attribution as provided in Section 3(a)(1)(A)(i) .\n" +
                "    Other rights .\n" +
                "        Moral rights, such as the right of integrity, are not licensed under this Public License, nor are publicity, privacy, and/or other similar personality rights; however, to the extent possible, the Licensor waives and/or agrees not to assert any such rights held by the Licensor to the limited extent necessary to allow You to exercise the Licensed Rights, but not otherwise.\n" +
                "        Patent and trademark rights are not licensed under this Public License.\n" +
                "        To the extent possible, the Licensor waives any right to collect royalties from You for the exercise of the Licensed Rights, whether directly or through a collecting society under any voluntary or waivable statutory or compulsory licensing scheme. In all other cases the Licensor expressly reserves any right to collect such royalties.\n" +
                "\n" +
                "Section 3 – License Conditions.\n" +
                "\n" +
                "Your exercise of the Licensed Rights is expressly made subject to the following conditions.\n" +
                "\n" +
                "    Attribution .\n" +
                "\n" +
                "        If You Share the Licensed Material (including in modified form), You must:\n" +
                "            retain the following if it is supplied by the Licensor with the Licensed Material:\n" +
                "                identification of the creator(s) of the Licensed Material and any others designated to receive attribution, in any reasonable manner requested by the Licensor (including by pseudonym if designated);\n" +
                "                a copyright notice;\n" +
                "                a notice that refers to this Public License;\n" +
                "                a notice that refers to the disclaimer of warranties;\n" +
                "                a URI or hyperlink to the Licensed Material to the extent reasonably practicable;\n" +
                "            indicate if You modified the Licensed Material and retain an indication of any previous modifications; and\n" +
                "            indicate the Licensed Material is licensed under this Public License, and include the text of, or the URI or hyperlink to, this Public License.\n" +
                "        You may satisfy the conditions in Section 3(a)(1) in any reasonable manner based on the medium, means, and context in which You Share the Licensed Material. For example, it may be reasonable to satisfy the conditions by providing a URI or hyperlink to a resource that includes the required information.\n" +
                "        If requested by the Licensor, You must remove any of the information required by Section 3(a)(1)(A) to the extent reasonably practicable.\n" +
                "        If You Share Adapted Material You produce, the Adapter's License You apply must not prevent recipients of the Adapted Material from complying with this Public License.\n" +
                "\n" +
                "Section 4 – Sui Generis Database Rights.\n" +
                "\n" +
                "Where the Licensed Rights include Sui Generis Database Rights that apply to Your use of the Licensed Material:\n" +
                "\n" +
                "    for the avoidance of doubt, Section 2(a)(1) grants You the right to extract, reuse, reproduce, and Share all or a substantial portion of the contents of the database;\n" +
                "    if You include all or a substantial portion of the database contents in a database in which You have Sui Generis Database Rights, then the database in which You have Sui Generis Database Rights (but not its individual contents) is Adapted Material; and\n" +
                "    You must comply with the conditions in Section 3(a) if You Share all or a substantial portion of the contents of the database.\n" +
                "\n" +
                "For the avoidance of doubt, this Section 4 supplements and does not replace Your obligations under this Public License where the Licensed Rights include other Copyright and Similar Rights.\n" +
                "Section 5 – Disclaimer of Warranties and Limitation of Liability.\n" +
                "\n" +
                "    Unless otherwise separately undertaken by the Licensor, to the extent possible, the Licensor offers the Licensed Material as-is and as-available, and makes no representations or warranties of any kind concerning the Licensed Material, whether express, implied, statutory, or other. This includes, without limitation, warranties of title, merchantability, fitness for a particular purpose, non-infringement, absence of latent or other defects, accuracy, or the presence or absence of errors, whether or not known or discoverable. Where disclaimers of warranties are not allowed in full or in part, this disclaimer may not apply to You.\n" +
                "    To the extent possible, in no event will the Licensor be liable to You on any legal theory (including, without limitation, negligence) or otherwise for any direct, special, indirect, incidental, consequential, punitive, exemplary, or other losses, costs, expenses, or damages arising out of this Public License or use of the Licensed Material, even if the Licensor has been advised of the possibility of such losses, costs, expenses, or damages. Where a limitation of liability is not allowed in full or in part, this limitation may not apply to You.\n" +
                "    The disclaimer of warranties and limitation of liability provided above shall be interpreted in a manner that, to the extent possible, most closely approximates an absolute disclaimer and waiver of all liability.\n" +
                "\n" +
                "Section 6 – Term and Termination.\n" +
                "\n" +
                "    This Public License applies for the term of the Copyright and Similar Rights licensed here. However, if You fail to comply with this Public License, then Your rights under this Public License terminate automatically.\n" +
                "\n" +
                "    Where Your right to use the Licensed Material has terminated under Section 6(a), it reinstates:\n" +
                "        automatically as of the date the violation is cured, provided it is cured within 30 days of Your discovery of the violation; or\n" +
                "        upon express reinstatement by the Licensor.\n" +
                "\n" +
                "    For the avoidance of doubt, this Section 6(b) does not affect any right the Licensor may have to seek remedies for Your violations of this Public License.\n" +
                "    For the avoidance of doubt, the Licensor may also offer the Licensed Material under separate terms or conditions or stop distributing the Licensed Material at any time; however, doing so will not terminate this Public License.\n" +
                "    Sections 1 , 5 , 6 , 7 , and 8 survive termination of this Public License.\n" +
                "\n" +
                "Section 7 – Other Terms and Conditions.\n" +
                "\n" +
                "    The Licensor shall not be bound by any additional or different terms or conditions communicated by You unless expressly agreed.\n" +
                "    Any arrangements, understandings, or agreements regarding the Licensed Material not stated herein are separate from and independent of the terms and conditions of this Public License.\n" +
                "\n" +
                "Section 8 – Interpretation.\n" +
                "\n" +
                "    For the avoidance of doubt, this Public License does not, and shall not be interpreted to, reduce, limit, restrict, or impose conditions on any use of the Licensed Material that could lawfully be made without permission under this Public License.\n" +
                "    To the extent possible, if any provision of this Public License is deemed unenforceable, it shall be automatically reformed to the minimum extent necessary to make it enforceable. If the provision cannot be reformed, it shall be severed from this Public License without affecting the enforceability of the remaining terms and conditions.\n" +
                "    No term or condition of this Public License will be waived and no failure to comply consented to unless expressly agreed to by the Licensor.\n" +
                "    Nothing in this Public License constitutes or may be interpreted as a limitation upon, or waiver of, any privileges and immunities that apply to the Licensor or You, including from the legal processes of any jurisdiction or authority.\n" +
                "\n"
        },
        {
            name: "OFL License",
            text: "PREAMBLE\n" +
                "\n" +
                "The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects, to support the font creation efforts of academic and linguistic communities, and to provide a free and open framework in which fonts may be shared and improved in partnership\n" +
                "with others.\n" +
                "\n" +
                "The OFL allows the licensed fonts to be used, studied, modified and redistributed freely as long as they are not sold by themselves. The fonts, including any derivative works, can be bundled, embedded, redistributed and/or sold with any software provided that any reserved\n" +
                "names are not used by derivative works. The fonts and derivatives, however, cannot be released under any other type of license. The requirement for fonts to remain under this license does not apply to any document created using the fonts or their derivatives.\n" +
                "DEFINITIONS\n" +
                "\n" +
                "“Font Software” refers to the set of files released by the Copyright Holder(s) under this license and clearly marked as such. This may include source files, build scripts and documentation.\n" +
                "\n" +
                "“Reserved Font Name” refers to any names specified as such after the copyright statement(s).\n" +
                "\n" +
                "“Original Version” refers to the collection of Font Software components as distributed by the Copyright Holder(s).\n" +
                "\n" +
                "“Modified Version” refers to any derivative made by adding to, deleting, or substituting – in part or in whole – any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.\n" +
                "\n" +
                "“Author” refers to any designer, engineer, programmer, technical writer or other person who contributed to the Font Software.\n" +
                "PERMISSION & CONDITIONS\n" +
                "\n" +
                "Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to the following conditions:\n" +
                "\n" +
                "1) Neither the Font Software nor any of its individual components, in Original or Modified Versions, may be sold by itself.\n" +
                "\n" +
                "2) Original or Modified Versions of the Font Software may be bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license. These can be included either as stand-alone text files, human-readable headers or in the appropriate machine-readable metadata fields within text or binary files as long as those fields can be easily viewed by the user.\n" +
                "\n" +
                "3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.\n" +
                "\n" +
                "4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font Software shall not be used to promote, endorse or advertise any Modified Version, except to acknowledge the contribution(s) of the Copyright Holder(s) and the Author(s) or with their explicit written permission.\n" +
                "\n" +
                "5) The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license, and must not be distributed under any other license. The requirement for fonts to remain under this license does not apply to any document created using the Font Software.\n" +
                "\n" +
                "TERMINATION\n" +
                "\n" +
                "This license becomes null and void if any of the above conditions are\n" +
                "not met.\n" +
                "\n" +
                "DISCLAIMER\n" +
                "\n" +
                "THE FONT SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,\n" +
                "EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF\n" +
                "MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT\n" +
                "OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE\n" +
                "COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\n" +
                "INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL\n" +
                "DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\n" +
                "FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM\n" +
                "OTHER DEALINGS IN THE FONT SOFTWARE."
        },
        {
            name: "GNU LIBRARY GENERAL PUBLIC LICENSE Version 2, June 1991",
            text: "Copyright (C) 1991 Free Software Foundation, Inc.\n" +
                " 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n" +
                " Everyone is permitted to copy and distribute verbatim copies\n" +
                " of this license document, but changing it is not allowed.\n" +
                "\n" +
                "[This is the first released version of the library GPL.  It is\n" +
                " numbered 2 because it goes with version 2 of the ordinary GPL.]\n" +
                "\n" +
                "                            Preamble\n" +
                "\n" +
                "  The licenses for most software are designed to take away your\n" +
                "freedom to share and change it.  By contrast, the GNU General Public\n" +
                "Licenses are intended to guarantee your freedom to share and change\n" +
                "free software--to make sure the software is free for all its users.\n" +
                "\n" +
                "  This license, the Library General Public License, applies to some\n" +
                "specially designated Free Software Foundation software, and to any\n" +
                "other libraries whose authors decide to use it.  You can use it for\n" +
                "your libraries, too.\n" +
                "\n" +
                "  When we speak of free software, we are referring to freedom, not\n" +
                "price.  Our General Public Licenses are designed to make sure that you\n" +
                "have the freedom to distribute copies of free software (and charge for\n" +
                "this service if you wish), that you receive source code or can get it\n" +
                "if you want it, that you can change the software or use pieces of it\n" +
                "in new free programs; and that you know you can do these things.\n" +
                "\n" +
                "  To protect your rights, we need to make restrictions that forbid\n" +
                "anyone to deny you these rights or to ask you to surrender the rights.\n" +
                "These restrictions translate to certain responsibilities for you if\n" +
                "you distribute copies of the library, or if you modify it.\n" +
                "\n" +
                "  For example, if you distribute copies of the library, whether gratis\n" +
                "or for a fee, you must give the recipients all the rights that we gave\n" +
                "you.  You must make sure that they, too, receive or can get the source\n" +
                "code.  If you link a program with the library, you must provide\n" +
                "complete object files to the recipients so that they can relink them\n" +
                "with the library, after making changes to the library and recompiling\n" +
                "it.  And you must show them these terms so they know their rights.\n" +
                "\n" +
                "  Our method of protecting your rights has two steps: (1) copyright\n" +
                "the library, and (2) offer you this license which gives you legal\n" +
                "permission to copy, distribute and/or modify the library.\n" +
                "\n" +
                "  Also, for each distributor's protection, we want to make certain\n" +
                "that everyone understands that there is no warranty for this free\n" +
                "library.  If the library is modified by someone else and passed on, we\n" +
                "want its recipients to know that what they have is not the original\n" +
                "version, so that any problems introduced by others will not reflect on\n" +
                "the original authors' reputations.\n" +
                "\f\n" +
                "  Finally, any free program is threatened constantly by software\n" +
                "patents.  We wish to avoid the danger that companies distributing free\n" +
                "software will individually obtain patent licenses, thus in effect\n" +
                "transforming the program into proprietary software.  To prevent this,\n" +
                "we have made it clear that any patent must be licensed for everyone's\n" +
                "free use or not licensed at all.\n" +
                "\n" +
                "  Most GNU software, including some libraries, is covered by the ordinary\n" +
                "GNU General Public License, which was designed for utility programs.  This\n" +
                "license, the GNU Library General Public License, applies to certain\n" +
                "designated libraries.  This license is quite different from the ordinary\n" +
                "one; be sure to read it in full, and don't assume that anything in it is\n" +
                "the same as in the ordinary license.\n" +
                "\n" +
                "  The reason we have a separate public license for some libraries is that\n" +
                "they blur the distinction we usually make between modifying or adding to a\n" +
                "program and simply using it.  Linking a program with a library, without\n" +
                "changing the library, is in some sense simply using the library, and is\n" +
                "analogous to running a utility program or application program.  However, in\n" +
                "a textual and legal sense, the linked executable is a combined work, a\n" +
                "derivative of the original library, and the ordinary General Public License\n" +
                "treats it as such.\n" +
                "\n" +
                "  Because of this blurred distinction, using the ordinary General\n" +
                "Public License for libraries did not effectively promote software\n" +
                "sharing, because most developers did not use the libraries.  We\n" +
                "concluded that weaker conditions might promote sharing better.\n" +
                "\n" +
                "  However, unrestricted linking of non-free programs would deprive the\n" +
                "users of those programs of all benefit from the free status of the\n" +
                "libraries themselves.  This Library General Public License is intended to\n" +
                "permit developers of non-free programs to use free libraries, while\n" +
                "preserving your freedom as a user of such programs to change the free\n" +
                "libraries that are incorporated in them.  (We have not seen how to achieve\n" +
                "this as regards changes in header files, but we have achieved it as regards\n" +
                "changes in the actual functions of the Library.)  The hope is that this\n" +
                "will lead to faster development of free libraries.\n" +
                "\n" +
                "  The precise terms and conditions for copying, distribution and\n" +
                "modification follow.  Pay close attention to the difference between a\n" +
                "\"work based on the library\" and a \"work that uses the library\".  The\n" +
                "former contains code derived from the library, while the latter only\n" +
                "works together with the library.\n" +
                "\n" +
                "  Note that it is possible for a library to be covered by the ordinary\n" +
                "General Public License rather than by this special one.\n" +
                "\f\n" +
                "                  GNU LIBRARY GENERAL PUBLIC LICENSE\n" +
                "   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION\n" +
                "\n" +
                "  0. This License Agreement applies to any software library which\n" +
                "contains a notice placed by the copyright holder or other authorized\n" +
                "party saying it may be distributed under the terms of this Library\n" +
                "General Public License (also called \"this License\").  Each licensee is\n" +
                "addressed as \"you\".\n" +
                "\n" +
                "  A \"library\" means a collection of software functions and/or data\n" +
                "prepared so as to be conveniently linked with application programs\n" +
                "(which use some of those functions and data) to form executables.\n" +
                "\n" +
                "  The \"Library\", below, refers to any such software library or work\n" +
                "which has been distributed under these terms.  A \"work based on the\n" +
                "Library\" means either the Library or any derivative work under\n" +
                "copyright law: that is to say, a work containing the Library or a\n" +
                "portion of it, either verbatim or with modifications and/or translated\n" +
                "straightforwardly into another language.  (Hereinafter, translation is\n" +
                "included without limitation in the term \"modification\".)\n" +
                "\n" +
                "  \"Source code\" for a work means the preferred form of the work for\n" +
                "making modifications to it.  For a library, complete source code means\n" +
                "all the source code for all modules it contains, plus any associated\n" +
                "interface definition files, plus the scripts used to control compilation\n" +
                "and installation of the library.\n" +
                "\n" +
                "  Activities other than copying, distribution and modification are not\n" +
                "covered by this License; they are outside its scope.  The act of\n" +
                "running a program using the Library is not restricted, and output from\n" +
                "such a program is covered only if its contents constitute a work based\n" +
                "on the Library (independent of the use of the Library in a tool for\n" +
                "writing it).  Whether that is true depends on what the Library does\n" +
                "and what the program that uses the Library does.\n" +
                "  \n" +
                "  1. You may copy and distribute verbatim copies of the Library's\n" +
                "complete source code as you receive it, in any medium, provided that\n" +
                "you conspicuously and appropriately publish on each copy an\n" +
                "appropriate copyright notice and disclaimer of warranty; keep intact\n" +
                "all the notices that refer to this License and to the absence of any\n" +
                "warranty; and distribute a copy of this License along with the\n" +
                "Library.\n" +
                "\n" +
                "  You may charge a fee for the physical act of transferring a copy,\n" +
                "and you may at your option offer warranty protection in exchange for a\n" +
                "fee.\n" +
                "\f\n" +
                "  2. You may modify your copy or copies of the Library or any portion\n" +
                "of it, thus forming a work based on the Library, and copy and\n" +
                "distribute such modifications or work under the terms of Section 1\n" +
                "above, provided that you also meet all of these conditions:\n" +
                "\n" +
                "    a) The modified work must itself be a software library.\n" +
                "\n" +
                "    b) You must cause the files modified to carry prominent notices\n" +
                "    stating that you changed the files and the date of any change.\n" +
                "\n" +
                "    c) You must cause the whole of the work to be licensed at no\n" +
                "    charge to all third parties under the terms of this License.\n" +
                "\n" +
                "    d) If a facility in the modified Library refers to a function or a\n" +
                "    table of data to be supplied by an application program that uses\n" +
                "    the facility, other than as an argument passed when the facility\n" +
                "    is invoked, then you must make a good faith effort to ensure that,\n" +
                "    in the event an application does not supply such function or\n" +
                "    table, the facility still operates, and performs whatever part of\n" +
                "    its purpose remains meaningful.\n" +
                "\n" +
                "    (For example, a function in a library to compute square roots has\n" +
                "    a purpose that is entirely well-defined independent of the\n" +
                "    application.  Therefore, Subsection 2d requires that any\n" +
                "    application-supplied function or table used by this function must\n" +
                "    be optional: if the application does not supply it, the square\n" +
                "    root function must still compute square roots.)\n" +
                "\n" +
                "These requirements apply to the modified work as a whole.  If\n" +
                "identifiable sections of that work are not derived from the Library,\n" +
                "and can be reasonably considered independent and separate works in\n" +
                "themselves, then this License, and its terms, do not apply to those\n" +
                "sections when you distribute them as separate works.  But when you\n" +
                "distribute the same sections as part of a whole which is a work based\n" +
                "on the Library, the distribution of the whole must be on the terms of\n" +
                "this License, whose permissions for other licensees extend to the\n" +
                "entire whole, and thus to each and every part regardless of who wrote\n" +
                "it.\n" +
                "\n" +
                "Thus, it is not the intent of this section to claim rights or contest\n" +
                "your rights to work written entirely by you; rather, the intent is to\n" +
                "exercise the right to control the distribution of derivative or\n" +
                "collective works based on the Library.\n" +
                "\n" +
                "In addition, mere aggregation of another work not based on the Library\n" +
                "with the Library (or with a work based on the Library) on a volume of\n" +
                "a storage or distribution medium does not bring the other work under\n" +
                "the scope of this License.\n" +
                "\n" +
                "  3. You may opt to apply the terms of the ordinary GNU General Public\n" +
                "License instead of this License to a given copy of the Library.  To do\n" +
                "this, you must alter all the notices that refer to this License, so\n" +
                "that they refer to the ordinary GNU General Public License, version 2,\n" +
                "instead of to this License.  (If a newer version than version 2 of the\n" +
                "ordinary GNU General Public License has appeared, then you can specify\n" +
                "that version instead if you wish.)  Do not make any other change in\n" +
                "these notices.\n" +
                "\f\n" +
                "  Once this change is made in a given copy, it is irreversible for\n" +
                "that copy, so the ordinary GNU General Public License applies to all\n" +
                "subsequent copies and derivative works made from that copy.\n" +
                "\n" +
                "  This option is useful when you wish to copy part of the code of\n" +
                "the Library into a program that is not a library.\n" +
                "\n" +
                "  4. You may copy and distribute the Library (or a portion or\n" +
                "derivative of it, under Section 2) in object code or executable form\n" +
                "under the terms of Sections 1 and 2 above provided that you accompany\n" +
                "it with the complete corresponding machine-readable source code, which\n" +
                "must be distributed under the terms of Sections 1 and 2 above on a\n" +
                "medium customarily used for software interchange.\n" +
                "\n" +
                "  If distribution of object code is made by offering access to copy\n" +
                "from a designated place, then offering equivalent access to copy the\n" +
                "source code from the same place satisfies the requirement to\n" +
                "distribute the source code, even though third parties are not\n" +
                "compelled to copy the source along with the object code.\n" +
                "\n" +
                "  5. A program that contains no derivative of any portion of the\n" +
                "Library, but is designed to work with the Library by being compiled or\n" +
                "linked with it, is called a \"work that uses the Library\".  Such a\n" +
                "work, in isolation, is not a derivative work of the Library, and\n" +
                "therefore falls outside the scope of this License.\n" +
                "\n" +
                "  However, linking a \"work that uses the Library\" with the Library\n" +
                "creates an executable that is a derivative of the Library (because it\n" +
                "contains portions of the Library), rather than a \"work that uses the\n" +
                "library\".  The executable is therefore covered by this License.\n" +
                "Section 6 states terms for distribution of such executables.\n" +
                "\n" +
                "  When a \"work that uses the Library\" uses material from a header file\n" +
                "that is part of the Library, the object code for the work may be a\n" +
                "derivative work of the Library even though the source code is not.\n" +
                "Whether this is true is especially significant if the work can be\n" +
                "linked without the Library, or if the work is itself a library.  The\n" +
                "threshold for this to be true is not precisely defined by law.\n" +
                "\n" +
                "  If such an object file uses only numerical parameters, data\n" +
                "structure layouts and accessors, and small macros and small inline\n" +
                "functions (ten lines or less in length), then the use of the object\n" +
                "file is unrestricted, regardless of whether it is legally a derivative\n" +
                "work.  (Executables containing this object code plus portions of the\n" +
                "Library will still fall under Section 6.)\n" +
                "\n" +
                "  Otherwise, if the work is a derivative of the Library, you may\n" +
                "distribute the object code for the work under the terms of Section 6.\n" +
                "Any executables containing that work also fall under Section 6,\n" +
                "whether or not they are linked directly with the Library itself.\n" +
                "\f\n" +
                "  6. As an exception to the Sections above, you may also compile or\n" +
                "link a \"work that uses the Library\" with the Library to produce a\n" +
                "work containing portions of the Library, and distribute that work\n" +
                "under terms of your choice, provided that the terms permit\n" +
                "modification of the work for the customer's own use and reverse\n" +
                "engineering for debugging such modifications.\n" +
                "\n" +
                "  You must give prominent notice with each copy of the work that the\n" +
                "Library is used in it and that the Library and its use are covered by\n" +
                "this License.  You must supply a copy of this License.  If the work\n" +
                "during execution displays copyright notices, you must include the\n" +
                "copyright notice for the Library among them, as well as a reference\n" +
                "directing the user to the copy of this License.  Also, you must do one\n" +
                "of these things:\n" +
                "\n" +
                "    a) Accompany the work with the complete corresponding\n" +
                "    machine-readable source code for the Library including whatever\n" +
                "    changes were used in the work (which must be distributed under\n" +
                "    Sections 1 and 2 above); and, if the work is an executable linked\n" +
                "    with the Library, with the complete machine-readable \"work that\n" +
                "    uses the Library\", as object code and/or source code, so that the\n" +
                "    user can modify the Library and then relink to produce a modified\n" +
                "    executable containing the modified Library.  (It is understood\n" +
                "    that the user who changes the contents of definitions files in the\n" +
                "    Library will not necessarily be able to recompile the application\n" +
                "    to use the modified definitions.)\n" +
                "\n" +
                "    b) Accompany the work with a written offer, valid for at\n" +
                "    least three years, to give the same user the materials\n" +
                "    specified in Subsection 6a, above, for a charge no more\n" +
                "    than the cost of performing this distribution.\n" +
                "\n" +
                "    c) If distribution of the work is made by offering access to copy\n" +
                "    from a designated place, offer equivalent access to copy the above\n" +
                "    specified materials from the same place.\n" +
                "\n" +
                "    d) Verify that the user has already received a copy of these\n" +
                "    materials or that you have already sent this user a copy.\n" +
                "\n" +
                "  For an executable, the required form of the \"work that uses the\n" +
                "Library\" must include any data and utility programs needed for\n" +
                "reproducing the executable from it.  However, as a special exception,\n" +
                "the source code distributed need not include anything that is normally\n" +
                "distributed (in either source or binary form) with the major\n" +
                "components (compiler, kernel, and so on) of the operating system on\n" +
                "which the executable runs, unless that component itself accompanies\n" +
                "the executable.\n" +
                "\n" +
                "  It may happen that this requirement contradicts the license\n" +
                "restrictions of other proprietary libraries that do not normally\n" +
                "accompany the operating system.  Such a contradiction means you cannot\n" +
                "use both them and the Library together in an executable that you\n" +
                "distribute.\n" +
                "\f\n" +
                "  7. You may place library facilities that are a work based on the\n" +
                "Library side-by-side in a single library together with other library\n" +
                "facilities not covered by this License, and distribute such a combined\n" +
                "library, provided that the separate distribution of the work based on\n" +
                "the Library and of the other library facilities is otherwise\n" +
                "permitted, and provided that you do these two things:\n" +
                "\n" +
                "    a) Accompany the combined library with a copy of the same work\n" +
                "    based on the Library, uncombined with any other library\n" +
                "    facilities.  This must be distributed under the terms of the\n" +
                "    Sections above.\n" +
                "\n" +
                "    b) Give prominent notice with the combined library of the fact\n" +
                "    that part of it is a work based on the Library, and explaining\n" +
                "    where to find the accompanying uncombined form of the same work.\n" +
                "\n" +
                "  8. You may not copy, modify, sublicense, link with, or distribute\n" +
                "the Library except as expressly provided under this License.  Any\n" +
                "attempt otherwise to copy, modify, sublicense, link with, or\n" +
                "distribute the Library is void, and will automatically terminate your\n" +
                "rights under this License.  However, parties who have received copies,\n" +
                "or rights, from you under this License will not have their licenses\n" +
                "terminated so long as such parties remain in full compliance.\n" +
                "\n" +
                "  9. You are not required to accept this License, since you have not\n" +
                "signed it.  However, nothing else grants you permission to modify or\n" +
                "distribute the Library or its derivative works.  These actions are\n" +
                "prohibited by law if you do not accept this License.  Therefore, by\n" +
                "modifying or distributing the Library (or any work based on the\n" +
                "Library), you indicate your acceptance of this License to do so, and\n" +
                "all its terms and conditions for copying, distributing or modifying\n" +
                "the Library or works based on it.\n" +
                "\n" +
                "  10. Each time you redistribute the Library (or any work based on the\n" +
                "Library), the recipient automatically receives a license from the\n" +
                "original licensor to copy, distribute, link with or modify the Library\n" +
                "subject to these terms and conditions.  You may not impose any further\n" +
                "restrictions on the recipients' exercise of the rights granted herein.\n" +
                "You are not responsible for enforcing compliance by third parties to\n" +
                "this License.\n" +
                "\f\n" +
                "  11. If, as a consequence of a court judgment or allegation of patent\n" +
                "infringement or for any other reason (not limited to patent issues),\n" +
                "conditions are imposed on you (whether by court order, agreement or\n" +
                "otherwise) that contradict the conditions of this License, they do not\n" +
                "excuse you from the conditions of this License.  If you cannot\n" +
                "distribute so as to satisfy simultaneously your obligations under this\n" +
                "License and any other pertinent obligations, then as a consequence you\n" +
                "may not distribute the Library at all.  For example, if a patent\n" +
                "license would not permit royalty-free redistribution of the Library by\n" +
                "all those who receive copies directly or indirectly through you, then\n" +
                "the only way you could satisfy both it and this License would be to\n" +
                "refrain entirely from distribution of the Library.\n" +
                "\n" +
                "If any portion of this section is held invalid or unenforceable under any\n" +
                "particular circumstance, the balance of the section is intended to apply,\n" +
                "and the section as a whole is intended to apply in other circumstances.\n" +
                "\n" +
                "It is not the purpose of this section to induce you to infringe any\n" +
                "patents or other property right claims or to contest validity of any\n" +
                "such claims; this section has the sole purpose of protecting the\n" +
                "integrity of the free software distribution system which is\n" +
                "implemented by public license practices.  Many people have made\n" +
                "generous contributions to the wide range of software distributed\n" +
                "through that system in reliance on consistent application of that\n" +
                "system; it is up to the author/donor to decide if he or she is willing\n" +
                "to distribute software through any other system and a licensee cannot\n" +
                "impose that choice.\n" +
                "\n" +
                "This section is intended to make thoroughly clear what is believed to\n" +
                "be a consequence of the rest of this License.\n" +
                "\n" +
                "  12. If the distribution and/or use of the Library is restricted in\n" +
                "certain countries either by patents or by copyrighted interfaces, the\n" +
                "original copyright holder who places the Library under this License may add\n" +
                "an explicit geographical distribution limitation excluding those countries,\n" +
                "so that distribution is permitted only in or among countries not thus\n" +
                "excluded.  In such case, this License incorporates the limitation as if\n" +
                "written in the body of this License.\n" +
                "\n" +
                "  13. The Free Software Foundation may publish revised and/or new\n" +
                "versions of the Library General Public License from time to time.\n" +
                "Such new versions will be similar in spirit to the present version,\n" +
                "but may differ in detail to address new problems or concerns.\n" +
                "\n" +
                "Each version is given a distinguishing version number.  If the Library\n" +
                "specifies a version number of this License which applies to it and\n" +
                "\"any later version\", you have the option of following the terms and\n" +
                "conditions either of that version or of any later version published by\n" +
                "the Free Software Foundation.  If the Library does not specify a\n" +
                "license version number, you may choose any version ever published by\n" +
                "the Free Software Foundation.\n" +
                "\f\n" +
                "  14. If you wish to incorporate parts of the Library into other free\n" +
                "programs whose distribution conditions are incompatible with these,\n" +
                "write to the author to ask for permission.  For software which is\n" +
                "copyrighted by the Free Software Foundation, write to the Free\n" +
                "Software Foundation; we sometimes make exceptions for this.  Our\n" +
                "decision will be guided by the two goals of preserving the free status\n" +
                "of all derivatives of our free software and of promoting the sharing\n" +
                "and reuse of software generally.\n" +
                "\n" +
                "                            NO WARRANTY\n" +
                "\n" +
                "  15. BECAUSE THE LIBRARY IS LICENSED FREE OF CHARGE, THERE IS NO\n" +
                "WARRANTY FOR THE LIBRARY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.\n" +
                "EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR\n" +
                "OTHER PARTIES PROVIDE THE LIBRARY \"AS IS\" WITHOUT WARRANTY OF ANY\n" +
                "KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE\n" +
                "IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\n" +
                "PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE\n" +
                "LIBRARY IS WITH YOU.  SHOULD THE LIBRARY PROVE DEFECTIVE, YOU ASSUME\n" +
                "THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.\n" +
                "\n" +
                "  16. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN\n" +
                "WRITING WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY\n" +
                "AND/OR REDISTRIBUTE THE LIBRARY AS PERMITTED ABOVE, BE LIABLE TO YOU\n" +
                "FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR\n" +
                "CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE\n" +
                "LIBRARY (INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING\n" +
                "RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A\n" +
                "FAILURE OF THE LIBRARY TO OPERATE WITH ANY OTHER SOFTWARE), EVEN IF\n" +
                "SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH\n" +
                "DAMAGES.\n" +
                "\n" +
                "                     END OF TERMS AND CONDITIONS\n" +
                "\f\n" +
                "           How to Apply These Terms to Your New Libraries\n" +
                "\n" +
                "  If you develop a new library, and you want it to be of the greatest\n" +
                "possible use to the public, we recommend making it free software that\n" +
                "everyone can redistribute and change.  You can do so by permitting\n" +
                "redistribution under these terms (or, alternatively, under the terms of the\n" +
                "ordinary General Public License).\n" +
                "\n" +
                "  To apply these terms, attach the following notices to the library.  It is\n" +
                "safest to attach them to the start of each source file to most effectively\n" +
                "convey the exclusion of warranty; and each file should have at least the\n" +
                "\"copyright\" line and a pointer to where the full notice is found.\n" +
                "\n" +
                "    <one line to give the library's name and a brief idea of what it does.>\n" +
                "    Copyright (C) <year>  <name of author>\n" +
                "\n" +
                "    This library is free software; you can redistribute it and/or\n" +
                "    modify it under the terms of the GNU Library General Public\n" +
                "    License as published by the Free Software Foundation; either\n" +
                "    version 2 of the License, or (at your option) any later version.\n" +
                "\n" +
                "    This library is distributed in the hope that it will be useful,\n" +
                "    but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
                "    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU\n" +
                "    Library General Public License for more details.\n" +
                "\n" +
                "    You should have received a copy of the GNU Library General Public\n" +
                "    License along with this library; if not, write to the Free Software\n" +
                "    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA\n" +
                "\n" +
                "Also add information on how to contact you by electronic and paper mail.\n" +
                "\n" +
                "You should also get your employer (if you work as a programmer) or your\n" +
                "school, if any, to sign a \"copyright disclaimer\" for the library, if\n" +
                "necessary.  Here is a sample; alter the names:\n" +
                "\n" +
                "  Yoyodyne, Inc., hereby disclaims all copyright interest in the\n" +
                "  library `Frob' (a library for tweaking knobs) written by James Random Hacker.\n" +
                "\n" +
                "  <signature of Ty Coon>, 1 April 1990\n" +
                "  Ty Coon, President of Vice\n" +
                "\n" +
                "That's all there is to it!\n"
        }
    ]

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('license-licenses-title')}</h1>
            </div>
            <div className="ml-8 mr-8 mb-4">
                <pre className="border text-sm w-full h-[calc(100dvh-9rem)] text-wrap overflow-y-auto p-1.5">
                    {licenses.sort((l1, l2) => localeComparator(l1.name, l2.name)).map((l, i) => {
                        return (
                            <p key={i}>
                                <b>{l.name}</b>&#10;{l.text}
                                {i + 1 < licenses.length && <>&#10;&#10;</>}
                            </p>
                        )
                    })}
                </pre>
            </div>
        </div>
    )
}

interface License {
    name: string
    text: string
}